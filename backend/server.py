"""JSON API and Persistent SQLite Database Backend for Brightloop.

Supports full Customer lifecycle management, recurring billing data,
todos ledger (SQLite + Supabase compatible), and real-time dashboard stats.

Run with:
    python backend/server.py
"""

from __future__ import annotations

import json
import os
import re
import sqlite3
import sys
import uuid
from contextlib import contextmanager
from datetime import date
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse

HOST = os.environ.get("BRIGHTLOOP_HOST", "127.0.0.1")
PORT = int(os.environ.get("BRIGHTLOOP_PORT", "8000"))
DB_PATH = Path(os.environ.get("BRIGHTLOOP_DB_PATH", Path(__file__).with_name("brightloop.db")))
MAX_BODY_SIZE = 64 * 1024
EMAIL_PATTERN = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+")
ALLOWED_STATUSES = {"Active", "Paused"}

REVENUE = [
    {"month": "May", "revenue": 280000, "collected": 235000},
    {"month": "Jun", "revenue": 315000, "collected": 272000},
    {"month": "Jul", "revenue": 298000, "collected": 256000},
    {"month": "Aug", "revenue": 368000, "collected": 319000},
    {"month": "Sep", "revenue": 392000, "collected": 355000},
    {"month": "Oct", "revenue": 445000, "collected": 405000},
]

PLANS = [
    {"name": "Growth", "value": 42, "color": "#6559e8"},
    {"name": "Scale", "value": 29, "color": "#2bb7a7"},
    {"name": "Starter", "value": 18, "color": "#f0a35b"},
    {"name": "Enterprise", "value": 11, "color": "#b7bdc9"},
]

TRANSACTIONS = [
    {"name": "Rohan Mehta", "company": "Mehta & Co.", "invoice": "INV-2048", "amount": "₹24,800", "date": "Oct 31, 2024", "status": "Paid", "initials": "RM", "color": "violet"},
    {"name": "Ananya Iyer", "company": "Iyer Studios", "invoice": "INV-2047", "amount": "₹18,500", "date": "Oct 30, 2024", "status": "Paid", "initials": "AI", "color": "orange"},
    {"name": "Arjun Nair", "company": "Nair Logistics", "invoice": "INV-2046", "amount": "₹42,000", "date": "Oct 29, 2024", "status": "Pending", "initials": "AN", "color": "teal"},
    {"name": "Neha Kapoor", "company": "Kapoor Retail", "invoice": "INV-2045", "amount": "₹12,900", "date": "Oct 28, 2024", "status": "Paid", "initials": "NK", "color": "blue"},
]

SEED_CUSTOMERS = [
    ("Rohan Mehta", "Mehta & Co.", "rohan@mehta.co", "Scale", 124000, "Active", "2024-09-12", "violet"),
    ("Ananya Iyer", "Iyer Studios", "ananya@iyerstudios.in", "Growth", 86400, "Active", "2024-09-04", "orange"),
    ("Arjun Nair", "Nair Logistics", "arjun@nairlogistics.com", "Enterprise", 248000, "Active", "2024-08-28", "teal"),
    ("Neha Kapoor", "Kapoor Retail", "neha@kapoorretail.in", "Starter", 38700, "Paused", "2024-08-19", "blue"),
    ("Vikram Shah", "Shah & Sons", "vikram@shahandsons.in", "Growth", 72200, "Active", "2024-08-07", "pink"),
]

SEED_TODOS = [
    ("Configure Odoo Brand variant (+INR 560) for enterprise rollouts", 1),
    ("Run monthly recurring billing day engine", 0),
    ("Verify tax calculation (GST 18%) on draft invoices", 1),
    ("Check overdue invoices and reconcile bank payments", 0),
    ("Review finance lead MRR & cash collection report", 0),
    ("Connect Supabase database with password Jaswanth1617", 1),
]


def initials_for(name: str) -> str:
    return "".join(part[0] for part in name.split()[:2]).upper()


def money_for(amount: int) -> str:
    return f"₹{amount:,}"


def customer_from_row(row: sqlite3.Row) -> dict[str, Any]:
    joined = date.fromisoformat(row["joined"])
    return {
        "id": row["id"],
        "name": row["name"],
        "company": row["company"],
        "email": row["email"],
        "plan": row["plan"],
        "revenue": money_for(row["revenue"]),
        "status": row["status"],
        "joined": joined.strftime("%d %b %Y"),
        "initials": initials_for(row["name"]),
        "color": row["color"],
    }


def connect_db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


@contextmanager
def db_connection():
    connection = connect_db()
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize_db() -> None:
    with db_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                company TEXT NOT NULL,
                email TEXT NOT NULL COLLATE NOCASE UNIQUE,
                plan TEXT NOT NULL,
                revenue INTEGER NOT NULL DEFAULT 0 CHECK (revenue >= 0),
                status TEXT NOT NULL CHECK (status IN ('Active', 'Paused')),
                joined TEXT NOT NULL,
                color TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                completed INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS app_meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
            """
        )
        seeded = connection.execute(
            "SELECT value FROM app_meta WHERE key = 'starter_data_seeded'"
        ).fetchone()
        if seeded is None:
            connection.executemany(
                """
                INSERT INTO customers (id, name, company, email, plan, revenue, status, joined, color)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (f"CUST-{index + 1:03d}", *customer)
                    for index, customer in enumerate(SEED_CUSTOMERS)
                ],
            )
            connection.executemany(
                """
                INSERT INTO todos (name, completed) VALUES (?, ?)
                """,
                SEED_TODOS,
            )
            connection.execute(
                "INSERT INTO app_meta (key, value) VALUES ('starter_data_seeded', 'true')"
            )


# Alias init_db for backward compatibility
init_db = initialize_db


class ApiHandler(BaseHTTPRequestHandler):
    server_version = "BrightloopDBAPI/2.0"

    def log_message(self, format: str, *args: Any) -> None:
        print(f"{self.address_string()} - {format % args}", flush=True)

    def _send_json(self, payload: Any, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.end_headers()
        self.wfile.write(body)

    def _send_error(self, message: str, status: HTTPStatus = HTTPStatus.BAD_REQUEST) -> None:
        self._send_json({"error": message}, status)

    def _read_json(self) -> dict[str, Any]:
        length_header = self.headers.get("Content-Length")
        if not length_header:
            return {}
        try:
            length = int(length_header)
        except ValueError as error:
            raise ValueError("Invalid Content-Length header") from error
        if length > MAX_BODY_SIZE:
            raise ValueError("Payload too large")
        raw_body = self.rfile.read(length)
        if not raw_body:
            return {}
        try:
            value = json.loads(raw_body)
        except json.JSONDecodeError as error:
            raise ValueError("Request body must be valid JSON") from error
        if not isinstance(value, dict):
            raise ValueError("Request body must be a JSON object")
        return value

    def _customer_id(self) -> str | None:
        parts = [unquote(part) for part in urlparse(self.path).path.strip("/").split("/") if part]
        if len(parts) == 3 and parts[0] == "api" and parts[1] == "customers":
            return parts[2]
        return None

    def _todo_id(self) -> int | None:
        parts = [unquote(part) for part in urlparse(self.path).path.strip("/").split("/") if part]
        if len(parts) >= 3 and parts[0] == "api" and parts[1] == "todos":
            try:
                return int(parts[2])
            except ValueError:
                return None
        return None

    def do_OPTIONS(self) -> None:
        self._send_json({}, HTTPStatus.NO_CONTENT)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        query = parse_qs(parsed.query)

        if path == "/api/health":
            with db_connection() as connection:
                total_cust = connection.execute("SELECT COUNT(*) FROM customers").fetchone()[0]
                total_todos = connection.execute("SELECT COUNT(*) FROM todos").fetchone()[0]
            self._send_json({
                "status": "ok",
                "database": "connected",
                "counts": {"customers": total_cust, "todos": total_todos}
            })
            return

        if path == "/api/db/stats":
            with db_connection() as connection:
                total_cust = connection.execute("SELECT COUNT(*) FROM customers").fetchone()[0]
                total_todos = connection.execute("SELECT COUNT(*) FROM todos").fetchone()[0]
            self._send_json({
                "engine": "SQLite 3",
                "databaseFile": str(DB_PATH),
                "tableCounts": {"customers": total_cust, "todos": total_todos},
                "status": "connected"
            })
            return

        if path == "/api/todos":
            with db_connection() as connection:
                rows = connection.execute(
                    "SELECT id, name, completed, created_at FROM todos ORDER BY id DESC"
                ).fetchall()
            todos = [
                {
                    "id": row["id"],
                    "name": row["name"],
                    "completed": bool(row["completed"]),
                    "created_at": row["created_at"],
                }
                for row in rows
            ]
            self._send_json(todos)
            return

        if path == "/api/dashboard":
            with db_connection() as connection:
                total_customers = connection.execute("SELECT COUNT(*) FROM customers").fetchone()[0]
                active_customers = connection.execute(
                    "SELECT COUNT(*) FROM customers WHERE status = 'Active'"
                ).fetchone()[0]
                total_revenue = connection.execute("SELECT COALESCE(SUM(revenue), 0) FROM customers").fetchone()[0]
            self._send_json({
                "revenue": REVENUE,
                "plans": PLANS,
                "transactions": TRANSACTIONS,
                "stats": {
                    "mrr": "₹4,45,000",
                    "activeSubscriptions": "248",
                    "customers": f"{total_customers:,}",
                    "outstanding": "₹86,400",
                },
                "summary": {
                    "totalCustomers": total_customers,
                    "activeCustomers": active_customers,
                    "totalRevenue": money_for(total_revenue),
                },
            })
            return

        customer_id = self._customer_id()
        if customer_id:
            with db_connection() as connection:
                row = connection.execute(
                    "SELECT * FROM customers WHERE id = ?", (customer_id,)
                ).fetchone()
            if row is None:
                self._send_error("Customer not found", HTTPStatus.NOT_FOUND)
                return
            self._send_json({"customer": customer_from_row(row)})
            return

        if path == "/api/customers":
            search = query.get("q", [""])[0].strip()
            limit = 50
            offset = 0
            try:
                if "limit" in query:
                    limit = max(1, min(100, int(query["limit"][0])))
                if "offset" in query:
                    offset = max(0, int(query["offset"][0]))
            except ValueError:
                self._send_error("limit and offset must be integers", HTTPStatus.BAD_REQUEST)
                return

            with db_connection() as connection:
                base_sql = "FROM customers"
                params: list[Any] = []
                if search:
                    base_sql += " WHERE name LIKE ? OR company LIKE ? OR email LIKE ?"
                    search_param = f"%{search}%"
                    params.extend([search_param, search_param, search_param])

                total = connection.execute(f"SELECT COUNT(*) {base_sql}", params).fetchone()[0]
                rows = connection.execute(
                    f"SELECT * {base_sql} ORDER BY joined DESC, rowid DESC LIMIT ? OFFSET ?",
                    [*params, limit, offset],
                ).fetchall()
                active_count = connection.execute(
                    "SELECT COUNT(*) FROM customers WHERE status = 'Active'"
                ).fetchone()[0]
                paused_count = connection.execute(
                    "SELECT COUNT(*) FROM customers WHERE status = 'Paused'"
                ).fetchone()[0]
                all_count = connection.execute("SELECT COUNT(*) FROM customers").fetchone()[0]

            self._send_json({
                "customers": [customer_from_row(row) for row in rows],
                "total": total,
                "limit": limit,
                "offset": offset,
                "summary": {
                    "total": all_count,
                    "active": active_count,
                    "paused": paused_count,
                },
            })
            return

        self._send_error("Not found", HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        path = urlparse(self.path).path.rstrip("/")

        if path == "/api/todos":
            try:
                data = self._read_json()
            except ValueError as error:
                self._send_error(str(error), HTTPStatus.BAD_REQUEST)
                return
            name = str(data.get("name", "")).strip()
            if not name:
                self._send_error("Todo name is required", HTTPStatus.BAD_REQUEST)
                return
            with db_connection() as connection:
                cur = connection.cursor()
                cur.execute("INSERT INTO todos (name) VALUES (?)", (name,))
                new_id = cur.lastrowid
                row = connection.execute(
                    "SELECT id, name, completed, created_at FROM todos WHERE id = ?", (new_id,)
                ).fetchone()
            self._send_json(
                {
                    "id": row["id"],
                    "name": row["name"],
                    "completed": bool(row["completed"]),
                    "created_at": row["created_at"],
                },
                HTTPStatus.CREATED,
            )
            return

        if path.startswith("/api/todos/") and path.endswith("/toggle"):
            todo_id = self._todo_id()
            if not todo_id:
                self._send_error("Invalid todo id", HTTPStatus.BAD_REQUEST)
                return
            with db_connection() as connection:
                connection.execute(
                    "UPDATE todos SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END WHERE id = ?",
                    (todo_id,),
                )
                row = connection.execute(
                    "SELECT id, name, completed, created_at FROM todos WHERE id = ?", (todo_id,)
                ).fetchone()
            if row is None:
                self._send_error("Todo not found", HTTPStatus.NOT_FOUND)
                return
            self._send_json({
                "id": row["id"],
                "name": row["name"],
                "completed": bool(row["completed"]),
                "created_at": row["created_at"],
            })
            return

        if path != "/api/customers":
            self._send_error("Not found", HTTPStatus.NOT_FOUND)
            return

        try:
            data = self._read_json()
        except ValueError as error:
            self._send_error(str(error), HTTPStatus.BAD_REQUEST)
            return

        fields = {
            "name": data.get("name", ""),
            "email": data.get("email", ""),
            "company": data.get("company", ""),
            "plan": data.get("plan", "Starter"),
            "status": data.get("status", "Active"),
        }
        error = self._validate_fields(fields, require_all=True)
        if error:
            self._send_error(error, HTTPStatus.BAD_REQUEST)
            return

        name = fields["name"].strip()
        email = fields["email"].strip().lower()
        company = fields["company"].strip() or "New customer"
        customer_id = str(uuid.uuid4())

        try:
            with db_connection() as connection:
                connection.execute(
                    """
                    INSERT INTO customers (id, name, company, email, plan, revenue, status, joined, color)
                    VALUES (?, ?, ?, ?, 'Starter', 0, 'Active', ?, 'violet')
                    """,
                    (customer_id, name, company, email, date.today().isoformat()),
                )
                row = connection.execute(
                    "SELECT * FROM customers WHERE id = ?", (customer_id,)
                ).fetchone()
        except sqlite3.IntegrityError:
            self._send_error("A customer with this email already exists", HTTPStatus.CONFLICT)
            return
        self._send_json({"customer": customer_from_row(row)}, HTTPStatus.CREATED)

    def do_PATCH(self) -> None:
        customer_id = self._customer_id()
        if not customer_id:
            self._send_error("Not found", HTTPStatus.NOT_FOUND)
            return
        try:
            data = self._read_json()
        except ValueError as error:
            self._send_error(str(error), HTTPStatus.BAD_REQUEST)
            return
        allowed = {"name", "email", "company", "plan", "status"}
        if not data or set(data) - allowed:
            self._send_error("Provide one or more valid customer fields", HTTPStatus.BAD_REQUEST)
            return

        with db_connection() as connection:
            current = connection.execute(
                "SELECT * FROM customers WHERE id = ?", (customer_id,)
            ).fetchone()
            if current is None:
                self._send_error("Customer not found", HTTPStatus.NOT_FOUND)
                return
            updated = {key: current[key] for key in allowed}
            updated.update(data)
            error = self._validate_fields(updated, require_all=True)
            if error:
                self._send_error(error, HTTPStatus.BAD_REQUEST)
                return
            try:
                connection.execute(
                    """
                    UPDATE customers
                    SET name = ?, email = ?, company = ?, plan = ?, status = ?, color = ?
                    WHERE id = ?
                    """,
                    (
                        updated["name"].strip(),
                        updated["email"].strip().lower(),
                        updated["company"].strip() or "New customer",
                        updated["plan"].strip(),
                        updated["status"],
                        current["color"] if "name" not in data else "violet",
                        customer_id,
                    ),
                )
                row = connection.execute(
                    "SELECT * FROM customers WHERE id = ?", (customer_id,)
                ).fetchone()
            except sqlite3.IntegrityError:
                self._send_error("A customer with this email already exists", HTTPStatus.CONFLICT)
                return
        self._send_json({"customer": customer_from_row(row)})

    def do_DELETE(self) -> None:
        # Check if deleting a todo
        todo_id = self._todo_id()
        if todo_id:
            with db_connection() as connection:
                cur = connection.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
            if cur.rowcount == 0:
                self._send_error("Todo not found", HTTPStatus.NOT_FOUND)
                return
            self._send_json({"deleted": True, "id": todo_id})
            return

        # Check if deleting a customer
        customer_id = self._customer_id()
        if not customer_id:
            self._send_error("Not found", HTTPStatus.NOT_FOUND)
            return
        with db_connection() as connection:
            cursor = connection.execute("DELETE FROM customers WHERE id = ?", (customer_id,))
        if cursor.rowcount == 0:
            self._send_error("Customer not found", HTTPStatus.NOT_FOUND)
            return
        self._send_json({"deleted": True})

    @staticmethod
    def _validate_fields(data: dict[str, Any], require_all: bool) -> str | None:
        required = ("name", "email", "company", "plan", "status")
        for field in required:
            value = data.get(field)
            if require_all and not isinstance(value, str):
                return f"{field.capitalize()} must be a string"
            if value is not None and not isinstance(value, str):
                return f"{field.capitalize()} must be a string"
        name = data.get("name", "")
        email = data.get("email", "")
        company = data.get("company", "")
        plan = data.get("plan", "")
        status = data.get("status", "")
        if not name.strip():
            return "A name is required"
        if len(name.strip()) > 120:
            return "Name must be 120 characters or fewer"
        if not EMAIL_PATTERN.fullmatch(email.strip()):
            return "A valid email is required"
        if len(email.strip()) > 254:
            return "Email must be 254 characters or fewer"
        if len(company.strip()) > 160:
            return "Company must be 160 characters or fewer"
        if not plan.strip() or len(plan.strip()) > 80:
            return "Plan must be between 1 and 80 characters"
        if status not in ALLOWED_STATUSES:
            return "Status must be Active or Paused"
        return None


if __name__ == "__main__":
    initialize_db()
    server = ThreadingHTTPServer((HOST, PORT), ApiHandler)
    server.daemon_threads = True
    print(f"Brightloop Database & API listening on http://{HOST}:{PORT} using {DB_PATH}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
