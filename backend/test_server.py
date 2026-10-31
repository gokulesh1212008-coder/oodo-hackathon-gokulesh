import json
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from pathlib import Path
from unittest.mock import patch

import server


class CustomerApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temp_dir.name) / "test.db"
        self.database_patch = patch.object(server, "DB_PATH", self.database_path)
        self.database_patch.start()
        server.initialize_db()
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.ApiHandler)
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self.thread.start()
        self.base_url = f"http://127.0.0.1:{self.httpd.server_port}"

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.thread.join()
        self.database_patch.stop()
        self.temp_dir.cleanup()

    def request_json(self, path, method="GET", body=None):
        data = None if body is None else json.dumps(body).encode("utf-8")
        request = Request(
            self.base_url + path,
            data=data,
            method=method,
            headers={"Content-Type": "application/json"},
        )
        try:
            response = urlopen(request)
        except HTTPError as error:
            response = error
        return response.code, json.loads(response.read() or b"{}")

    def test_seeded_customers_and_search_are_returned(self):
        status, payload = self.request_json("/api/customers?q=rohan")
        self.assertEqual(status, 200)
        self.assertEqual(payload["total"], 1)
        self.assertEqual(payload["customers"][0]["email"], "rohan@mehta.co")
        self.assertEqual(payload["summary"]["total"], 5)

    def test_customer_creation_persists_and_rejects_duplicate_email(self):
        body = {"name": "Sam Rivera", "email": "sam@example.com", "company": "Rivera Labs"}
        status, payload = self.request_json("/api/customers", "POST", body)
        self.assertEqual(status, 201)
        customer_id = payload["customer"]["id"]
        self.assertEqual(payload["customer"]["name"], "Sam Rivera")

        status, listed = self.request_json("/api/customers?q=sam")
        self.assertEqual(status, 200)
        self.assertEqual(listed["customers"][0]["id"], customer_id)
        self.assertEqual(listed["summary"]["total"], 6)

        status, error = self.request_json("/api/customers", "POST", body)
        self.assertEqual(status, 409)
        self.assertIn("already exists", error["error"])

    def test_customer_can_be_updated_and_deleted(self):
        _, listing = self.request_json("/api/customers")
        customer_id = listing["customers"][0]["id"]

        status, updated = self.request_json(
            f"/api/customers/{customer_id}", "PATCH", {"status": "Paused"}
        )
        self.assertEqual(status, 200)
        self.assertEqual(updated["customer"]["status"], "Paused")

        status, deleted = self.request_json(f"/api/customers/{customer_id}", "DELETE")
        self.assertEqual(status, 200)
        self.assertTrue(deleted["deleted"])
        status, missing = self.request_json(f"/api/customers/{customer_id}")
        self.assertEqual(status, 404)
        self.assertEqual(missing["error"], "Customer not found")

    def test_empty_customer_database_does_not_reseed_after_restart(self):
        _, listing = self.request_json("/api/customers")
        for customer in listing["customers"]:
            self.request_json(f"/api/customers/{customer['id']}", "DELETE")

        server.initialize_db()
        status, empty_listing = self.request_json("/api/customers")
        self.assertEqual(status, 200)
        self.assertEqual(empty_listing["total"], 0)
        self.assertEqual(empty_listing["customers"], [])

    def test_invalid_customer_payload_returns_validation_error(self):
        status, payload = self.request_json(
            "/api/customers", "POST", {"name": "", "email": "not-an-email"}
        )
        self.assertEqual(status, 400)
        self.assertIn("name", payload["error"].lower())


if __name__ == "__main__":
    unittest.main()
