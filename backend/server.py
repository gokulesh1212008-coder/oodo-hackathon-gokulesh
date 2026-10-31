"""Small JSON API and Database Backend for Brightloop.
Connects to SQLite database for persistent storage of Todos, Customers, Plans, and Invoices.

Run with:
    python backend/server.py
"""

from __future__ import annotations

import json
import re
import sys
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
try:
    from db import (
        create_todo,
        delete_todo,
        get_all_customers,
        get_connection,
        get_db_stats,
        get_todos,
        init_db,
        toggle_todo,
    )
except ImportError:
    from backend.db import (
        create_todo,
        delete_todo,
        get_all_customers,
        get_connection,
        get_db_stats,
        get_todos,
        init_db,
        toggle_todo,
    )

HOST = "127.0.0.1"
PORT = 8000

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


def initials_for(name: str) -> str:
    return "".join(part[0] for part in name.split()[:2]).upper()


class ApiHandler(BaseHTTPRequestHandler):
    server_version = "BrightloopDBAPI/2.0"

    def log_message(self, format: str, *args: Any) -> None:
        print(f"{self.address_string()} - {format % args}")

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

    def _read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length)
        value = json.loads(raw_body or b"{}")
        if not isinstance(value, dict):
            raise ValueError("Request body must be a JSON object")
        return value

    def do_OPTIONS(self) -> None:
        self._send_json({}, HTTPStatus.NO_CONTENT)

    def do_GET(self) -> None:
        path = urlparse(self.path).path.rstrip("/") or "/"
        
        if path == "/api/health":
            self._send_json({"status": "ok", "db": get_db_stats()})
            
        elif path == "/api/db/stats":
            self._send_json(get_db_stats())

        elif path == "/api/todos":
            todos = get_todos()
            # Support both format {todos: [...]} and raw array [...]
            self._send_json(todos)

        elif path == "/api/dashboard":
            stats = get_db_stats()
            self._send_json({
                "revenue": REVENUE,
                "plans": PLANS,
                "transactions": TRANSACTIONS,
                "stats": {
                    "mrr": "₹4,45,000",
                    "activeSubscriptions": "248",
                    "customers": str(stats["tableCounts"].get("customers", 5)),
                    "outstanding": "₹86,400",
                },
                "db": stats
            })

        elif path == "/api/customers":
            customers = get_all_customers()
            self._send_json({"customers": customers, "total": len(customers)})

        else:
            self._send_json({"error": "Not found", "path": path}, HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        path = urlparse(self.path).path.rstrip("/")
        
        if path == "/api/todos":
            try:
                data = self._read_json()
                name = str(data.get("name", "")).strip()
                if not name:
                    self._send_json({"error": "Todo name is required"}, HTTPStatus.BAD_REQUEST)
                    return
                new_todo = create_todo(name)
                self._send_json(new_todo, HTTPStatus.CREATED)
            except Exception as e:
                self._send_json({"error": str(e)}, HTTPStatus.BAD_REQUEST)
            return

        elif path.startswith("/api/todos/") and path.endswith("/toggle"):
            # e.g. /api/todos/1/toggle
            parts = path.split("/")
            try:
                todo_id = int(parts[3])
                updated = toggle_todo(todo_id)
                if updated:
                    self._send_json(updated)
                else:
                    self._send_json({"error": "Todo not found"}, HTTPStatus.NOT_FOUND)
            except Exception as e:
                self._send_json({"error": str(e)}, HTTPStatus.BAD_REQUEST)
            return

        elif path == "/api/customers":
            try:
                data = self._read_json()
            except (ValueError, json.JSONDecodeError):
                self._send_json({"error": "Request body must be valid JSON"}, HTTPStatus.BAD_REQUEST)
                return

            name = str(data.get("name", "")).strip()
            email = str(data.get("email", "")).strip()
            if not name or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
                self._send_json({"error": "A name and valid email are required"}, HTTPStatus.BAD_REQUEST)
                return

            customer_id = f"CUST-{int(get_db_stats()['tableCounts'].get('customers', 0)) + 1:03d}"
            company = str(data.get("company", "")).strip() or "New customer"
            phone = str(data.get("phone", "")).strip() or "+91 98000 00000"
            address = str(data.get("address", "")).strip() or "Mumbai, India"
            tax_id = str(data.get("taxId", "")).strip() or "27AABCU0000A1Z5"
            plan = str(data.get("plan", "")).strip() or "Starter Plan"

            conn = get_connection()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO customers (
                    id, name, company, email, phone, address, tax_id,
                    plan, status, joined, total_spent, active_subscriptions, initials, color
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', 'Today', 0, 1, ?, 'violet');
            """, (customer_id, name, company, email, phone, address, tax_id, plan, initials_for(name)))
            conn.commit()
            conn.close()

            self._send_json({
                "id": customer_id,
                "name": name,
                "company": company,
                "email": email,
                "plan": plan,
                "status": "Active"
            }, HTTPStatus.CREATED)
            return

        else:
            self._send_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def do_DELETE(self) -> None:
        path = urlparse(self.path).path.rstrip("/")
        if path.startswith("/api/todos/"):
            parts = path.split("/")
            try:
                todo_id = int(parts[3])
                deleted = delete_todo(todo_id)
                if deleted:
                    self._send_json({"success": True, "deleted_id": todo_id})
                else:
                    self._send_json({"error": "Todo not found"}, HTTPStatus.NOT_FOUND)
            except Exception as e:
                self._send_json({"error": str(e)}, HTTPStatus.BAD_REQUEST)
        else:
            self._send_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)


if __name__ == "__main__":
    init_db()
    print(f"Brightloop Database & API server listening on http://{HOST}:{PORT}", flush=True)
    ThreadingHTTPServer((HOST, PORT), ApiHandler).serve_forever()
