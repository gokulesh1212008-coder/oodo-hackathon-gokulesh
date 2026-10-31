"""Small JSON API for the Brightloop dashboard.

Run with:
    python backend/server.py
"""

from __future__ import annotations

import json
import re
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse


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

CUSTOMERS = [
    {"name": "Rohan Mehta", "company": "Mehta & Co.", "email": "rohan@mehta.co", "plan": "Scale", "revenue": "₹1,24,000", "status": "Active", "joined": "12 Sep 2024", "initials": "RM", "color": "violet"},
    {"name": "Ananya Iyer", "company": "Iyer Studios", "email": "ananya@iyerstudios.in", "plan": "Growth", "revenue": "₹86,400", "status": "Active", "joined": "04 Sep 2024", "initials": "AI", "color": "orange"},
    {"name": "Arjun Nair", "company": "Nair Logistics", "email": "arjun@nairlogistics.com", "plan": "Enterprise", "revenue": "₹2,48,000", "status": "Active", "joined": "28 Aug 2024", "initials": "AN", "color": "teal"},
    {"name": "Neha Kapoor", "company": "Kapoor Retail", "email": "neha@kapoorretail.in", "plan": "Starter", "revenue": "₹38,700", "status": "Paused", "joined": "19 Aug 2024", "initials": "NK", "color": "blue"},
    {"name": "Vikram Shah", "company": "Shah & Sons", "email": "vikram@shahandsons.in", "plan": "Growth", "revenue": "₹72,200", "status": "Active", "joined": "07 Aug 2024", "initials": "VS", "color": "pink"},
]


def initials_for(name: str) -> str:
    return "".join(part[0] for part in name.split()[:2]).upper()


class ApiHandler(BaseHTTPRequestHandler):
    server_version = "BrightloopAPI/1.0"

    def log_message(self, format: str, *args: Any) -> None:
        print(f"{self.address_string()} - {format % args}")

    def _send_json(self, payload: Any, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "http://localhost:5173")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
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
            self._send_json({"status": "ok"})
        elif path == "/api/dashboard":
            self._send_json({
                "revenue": REVENUE,
                "plans": PLANS,
                "transactions": TRANSACTIONS,
                "stats": {
                    "mrr": "₹4,45,000",
                    "activeSubscriptions": "248",
                    "customers": "1,284",
                    "outstanding": "₹86,400",
                },
            })
        elif path == "/api/customers":
            self._send_json({"customers": CUSTOMERS, "total": 248})
        else:
            self._send_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        path = urlparse(self.path).path.rstrip("/")
        if path != "/api/customers":
            self._send_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)
            return

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

        customer = {
            "name": name,
            "company": str(data.get("company", "")).strip() or "New customer",
            "email": email,
            "plan": "Starter",
            "revenue": "₹0",
            "status": "Active",
            "joined": "31 Oct 2024",
            "initials": initials_for(name),
            "color": "violet",
        }
        CUSTOMERS.insert(0, customer)
        self._send_json({"customer": customer}, HTTPStatus.CREATED)


if __name__ == "__main__":
    print(f"Brightloop API listening on http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), ApiHandler).serve_forever()
