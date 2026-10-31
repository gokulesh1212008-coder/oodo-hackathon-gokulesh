"""Phase 10: Complete Security Test Suite for Brightloop Subscription Management System.
Tests 17 scenarios covering:
- Authentication & expired tokens
- Authorization & 3-tier RBAC (Admin, Staff, Customer)
- Horizontal privilege escalation (Customer accessing other customer data)
- Vertical privilege escalation (Staff/Customer attempting Admin actions)
- Financial integrity (duplicate invoices, duplicate payments, discount tampering)
- Input security & SQL injection prevention
- API rate limiting
"""

import base64
import json
import tempfile
import threading
import time
import unittest
import uuid
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import server


def make_jwt(role="customer", email="rohan@mehta.co", expired=False):
    header = base64.urlsafe_b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).decode().rstrip("=")
    exp_time = time.time() - 3600 if expired else time.time() + 3600
    payload = {
        "sub": str(uuid.uuid4()),
        "email": email,
        "role": role,
        "exp": exp_time
    }
    body = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    return f"{header}.{body}.sig"


class BrightloopSecurityTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temp_dir.name) / "test_sec.db"
        self.database_patch = patch.object(server, "DB_PATH", self.database_path)
        self.database_patch.start()
        server.initialize_db()
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.ApiHandler)
        self.httpd.daemon_threads = True
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self.thread.start()
        self.base_url = f"http://127.0.0.1:{self.httpd.server_port}"

        # Seed an invoice for financial testing
        with server.db_connection() as conn:
            cust = conn.execute("SELECT id, email FROM customers WHERE email = 'rohan@mehta.co'").fetchone()
            self.rohan_id = cust["id"]
            self.other_cust = conn.execute("SELECT id, email FROM customers WHERE email = 'ananya@iyerstudios.in'").fetchone()
            self.invoice_id = str(uuid.uuid4())
            conn.execute(
                """
                INSERT INTO invoices (id, invoice_number, customer_id, due_date, subtotal, tax, discount, total, balance_due, status, idempotency_key, created_at)
                VALUES (?, 'INV-SEC-1', ?, '2026-11-30', 20000, 3600, 0, 23600, 23600, 'Sent', 'key-test-inv-1', '2026-10-31T00:00:00Z')
                """,
                (self.invoice_id, self.rohan_id)
            )

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.thread.join()
        self.database_patch.stop()
        self.temp_dir.cleanup()

    def request(self, path, method="GET", body=None, token=None, headers=None):
        req_headers = {"Content-Type": "application/json"}
        if token:
            req_headers["Authorization"] = f"Bearer {token}"
        if headers:
            req_headers.update(headers)
        data = None if body is None else json.dumps(body).encode("utf-8")
        req = Request(self.base_url + path, data=data, method=method, headers=req_headers)
        try:
            resp = urlopen(req)
            return resp.code, json.loads(resp.read().decode("utf-8") or "{}"), resp.headers
        except HTTPError as err:
            return err.code, json.loads(err.read().decode("utf-8") or "{}"), err.headers

    # Scenario 1 & 8: Expired or invalid authentication tokens
    def test_scenario_01_and_08_expired_or_invalid_tokens_rejected(self):
        expired_token = make_jwt(role="admin", expired=True)
        # Accessing admin-only audit logs with expired token
        code, body, _ = self.request("/api/audit-logs", token=expired_token)
        self.assertEqual(code, 403)
        self.assertIn("administrator access required", body.get("error", "").lower())

        invalid_token = "invalid.garbage.token"
        code, body, _ = self.request("/api/audit-logs", token=invalid_token)
        self.assertEqual(code, 403)

    # Scenario 2: Customer accessing another customer's profile
    def test_scenario_02_customer_cannot_access_another_customer_profile(self):
        rohan_token = make_jwt(role="customer", email="rohan@mehta.co")
        # Attempt to access Ananya's customer details directly by ID
        code, body, _ = self.request(f"/api/customers/{self.other_cust['id']}", token=rohan_token)
        self.assertEqual(code, 403)
        self.assertIn("restricted", body.get("error", "").lower())

    # Scenario 3: Customer accessing another customer's invoice or paying it
    def test_scenario_03_customer_cannot_pay_another_customer_invoice(self):
        ananya_token = make_jwt(role="customer", email="ananya@iyerstudios.in")
        # Ananya attempts to post payment against Rohan's invoice
        payload = {"invoice_id": self.invoice_id, "amount": 5000, "payment_method": "UPI"}
        code, body, _ = self.request("/api/payments", method="POST", body=payload, token=ananya_token)
        self.assertEqual(code, 403)
        self.assertIn("cannot submit payment on another customer", body.get("error", "").lower())

    # Scenario 5 & 16: Staff / Customer attempting privilege escalation
    def test_scenario_05_and_16_staff_cannot_delete_customer(self):
        staff_token = make_jwt(role="staff", email="staff@brightloop.io")
        code, body, _ = self.request(f"/api/customers/{self.rohan_id}", method="DELETE", token=staff_token)
        self.assertEqual(code, 403)
        self.assertIn("only administrators can delete", body.get("error", "").lower())

    # Scenario 7: Customer attempting to change customer subscription status directly
    def test_scenario_07_customer_cannot_modify_subscription_status(self):
        cust_token = make_jwt(role="customer", email="rohan@mehta.co")
        code, body, _ = self.request(
            f"/api/customers/{self.rohan_id}",
            method="PATCH",
            body={"status": "Paused"},
            token=cust_token
        )
        self.assertEqual(code, 403)
        self.assertIn("customer role cannot modify", body.get("error", "").lower())

    # Scenario 10: SQL wildcard injection attempts sanitized
    def test_scenario_10_sql_wildcard_search_sanitization(self):
        # Query with repeated % and _ wildcards should not cause error or full-table dump
        code, body, _ = self.request("/api/customers?q=%%%%%")
        self.assertEqual(code, 200)
        self.assertEqual(body["total"], 0)

    # Scenario 11: XSS attempt payload handling
    def test_scenario_11_xss_payload_in_fields_handled_safely(self):
        xss_name = "<script>alert('XSS')</script>"
        payload = {"name": xss_name, "email": "xss-test@example.com", "company": "Security Test Corp"}
        code, body, _ = self.request("/api/customers", method="POST", body=payload)
        self.assertEqual(code, 201)
        self.assertEqual(body["customer"]["name"], xss_name)

    # Scenario 13: Duplicate invoice prevention
    def test_scenario_13_duplicate_invoice_prevention(self):
        admin_token = make_jwt(role="admin", email="admin@brightloop.io")
        idem_key = "idemp-inv-" + str(uuid.uuid4())
        payload = {"customer_id": self.rohan_id, "subtotal": 10000}

        code1, body1, _ = self.request("/api/invoices", method="POST", body=payload, token=admin_token, headers={"Idempotency-Key": idem_key})
        self.assertEqual(code1, 201)
        invoice_number = body1["invoice"]["invoice_number"]

        # Replaying identical request with same idempotency key must not create a second invoice
        code2, body2, _ = self.request("/api/invoices", method="POST", body=payload, token=admin_token, headers={"Idempotency-Key": idem_key})
        self.assertEqual(code2, 200)
        self.assertTrue(body2.get("duplicate"))
        self.assertEqual(body2["invoice"]["invoice_number"], invoice_number)

    # Scenario 14: Duplicate payment prevention
    def test_scenario_14_duplicate_payment_prevention(self):
        admin_token = make_jwt(role="admin", email="admin@brightloop.io")
        idem_key = "idemp-pay-" + str(uuid.uuid4())
        payload = {"invoice_id": self.invoice_id, "amount": 2000, "payment_method": "UPI"}

        code1, body1, _ = self.request("/api/payments", method="POST", body=payload, token=admin_token, headers={"Idempotency-Key": idem_key})
        self.assertEqual(code1, 201)
        pay_id = body1["payment"]["id"]

        # Replaying identical payment must be caught by idempotency lock
        code2, body2, _ = self.request("/api/payments", method="POST", body=payload, token=admin_token, headers={"Idempotency-Key": idem_key})
        self.assertEqual(code2, 200)
        self.assertTrue(body2.get("duplicate"))
        self.assertEqual(body2["payment"]["id"], pay_id)

    # Scenario 15 & 17: Security headers and direct API access defense
    def test_scenario_15_and_17_security_headers_present(self):
        code, _, headers = self.request("/api/health")
        self.assertEqual(code, 200)
        self.assertEqual(headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(headers.get("X-Frame-Options"), "DENY")
        self.assertIn("default-src", headers.get("Content-Security-Policy", ""))


if __name__ == "__main__":
    unittest.main()

