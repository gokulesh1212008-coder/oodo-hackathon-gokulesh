"""Database management module for Brightloop.
Uses SQLite for persistent storage with automatic initialization and seeding.
"""

from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent / "database.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db() -> None:
    """Initialize SQLite tables and insert seed data if empty."""
    conn = get_connection()
    cur = conn.cursor()

    # 1. Todos table (for user's todo queries)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 2. Customers table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            company TEXT,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            address TEXT,
            tax_id TEXT,
            plan TEXT,
            status TEXT DEFAULT 'Active',
            joined TEXT,
            total_spent REAL DEFAULT 0,
            active_subscriptions INTEGER DEFAULT 0,
            initials TEXT,
            color TEXT
        );
    """)

    # 3. Products table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            sales_price REAL NOT NULL,
            cost_price REAL NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'Active',
            variants_json TEXT
        );
    """)

    # 4. Plans table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS plans (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            price REAL NOT NULL,
            billing_frequency TEXT NOT NULL,
            min_quantity INTEGER DEFAULT 1,
            start_date TEXT,
            end_date TEXT,
            auto_close_on_end INTEGER DEFAULT 0,
            allow_early_termination INTEGER DEFAULT 1,
            allow_pause INTEGER DEFAULT 1,
            auto_renew INTEGER DEFAULT 1,
            description TEXT
        );
    """)

    # 5. Subscriptions table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS subscriptions (
            id TEXT PRIMARY KEY,
            number TEXT NOT NULL,
            customer_id TEXT,
            customer_name TEXT,
            plan_id TEXT,
            plan_name TEXT,
            status TEXT NOT NULL,
            start_date TEXT,
            expiry_date TEXT,
            payment_terms TEXT,
            lines_json TEXT,
            total_amount REAL DEFAULT 0,
            auto_renew INTEGER DEFAULT 1
        );
    """)

    # 6. Invoices table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            invoice_number TEXT NOT NULL,
            subscription_id TEXT,
            customer_id TEXT,
            customer_name TEXT,
            date TEXT,
            due_date TEXT,
            status TEXT NOT NULL,
            lines_json TEXT,
            subtotal REAL DEFAULT 0,
            tax_amount REAL DEFAULT 0,
            total REAL DEFAULT 0,
            paid_amount REAL DEFAULT 0
        );
    """)

    # 7. Payments table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            payment_number TEXT NOT NULL,
            invoice_id TEXT,
            customer_id TEXT,
            customer_name TEXT,
            amount REAL NOT NULL,
            method TEXT NOT NULL,
            date TEXT,
            notes TEXT,
            status TEXT DEFAULT 'Success'
        );
    """)

    # 8. Discounts table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS discounts (
            id TEXT PRIMARY KEY,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            value REAL NOT NULL,
            min_purchase REAL DEFAULT 0,
            min_quantity INTEGER DEFAULT 0,
            max_uses INTEGER DEFAULT 0,
            current_uses INTEGER DEFAULT 0,
            start_date TEXT,
            end_date TEXT,
            active INTEGER DEFAULT 1,
            applies_to TEXT DEFAULT 'all'
        );
    """)

    conn.commit()

    # Seed Todos if empty
    cur.execute("SELECT COUNT(*) FROM todos;")
    if cur.fetchone()[0] == 0:
        sample_todos = [
            ("Configure Odoo Brand variant (+INR 560) for enterprise rollouts", 1),
            ("Run monthly recurring billing day engine", 0),
            ("Verify tax calculation (GST 18%) on draft invoices", 1),
            ("Check overdue invoices and reconcile bank payments", 0),
            ("Review finance lead MRR & cash collection report", 0),
            ("Connect Supabase database with password Jaswanth1617", 1),
        ]
        cur.executemany("INSERT INTO todos (name, completed) VALUES (?, ?);", sample_todos)

    # Seed Customers if empty
    cur.execute("SELECT COUNT(*) FROM customers;")
    if cur.fetchone()[0] == 0:
        sample_customers = [
            (
                "CUST-001", "Rohan Mehta", "Mehta & Co.", "rohan@mehta.co", "+91 98200 12345",
                "402 Trade Centre, Nariman Point, Mumbai 400021", "27AABCM1234F1Z8",
                "Scale Plan", "Active", "12 Sep 2024", 124000, 2, "RM", "violet"
            ),
            (
                "CUST-002", "Ananya Iyer", "Iyer Studios", "ananya@iyerstudios.in", "+91 98450 67890",
                "88 Indiranagar 100ft Road, Bengaluru 560038", "29AABCI5678K1Z3",
                "Growth Plan", "Active", "04 Sep 2024", 86400, 1, "AI", "orange"
            ),
            (
                "CUST-003", "Arjun Nair", "Nair Logistics", "arjun@nairlogistics.com", "+91 94470 33445",
                "14 Willington Island, Kochi 682003", "32AABCN9012P1Z1",
                "Enterprise Annual", "Active", "28 Aug 2024", 248000, 1, "AN", "teal"
            ),
            (
                "CUST-004", "Neha Kapoor", "Kapoor Retail", "neha@kapoorretail.in", "+91 98110 55667",
                "19 Connaught Place, New Delhi 110001", "07AABCK3456L1Z4",
                "Starter Plan", "Paused", "19 Aug 2024", 38700, 1, "NK", "blue"
            ),
            (
                "CUST-005", "Vikram Shah", "Shah & Sons", "vikram@shahandsons.in", "+91 98250 88990",
                "55 Ashram Road, Ahmedabad 380009", "24AABCS7890N1Z2",
                "Growth Plan", "Active", "07 Aug 2024", 72200, 1, "VS", "pink"
            ),
        ]
        cur.executemany("""
            INSERT INTO customers (
                id, name, company, email, phone, address, tax_id, plan,
                status, joined, total_spent, active_subscriptions, initials, color
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, sample_customers)

    # Seed Products if empty
    cur.execute("SELECT COUNT(*) FROM products;")
    if cur.fetchone()[0] == 0:
        sample_products = [
            (
                "PROD-001", "Brightloop CRM Core", "Software", 2000.0, 600.0,
                "Primary customer relationship & pipeline management system.", "Active",
                json.dumps([
                    {"id": "VAR-001", "name": "Standard Cloud Edition", "priceDelta": 0},
                    {"id": "VAR-002", "name": "Odoo Brand Integrated", "priceDelta": 560},
                    {"id": "VAR-003", "name": "Enterprise Dedicated Single-Tenant", "priceDelta": 1200}
                ])
            ),
            (
                "PROD-002", "Cloud ERP Suite", "Software", 4500.0, 1500.0,
                "Financial ledger, inventory tracking and recurring billing backend.", "Active",
                json.dumps([
                    {"id": "VAR-004", "name": "Multi-Tenant Standard", "priceDelta": 0},
                    {"id": "VAR-005", "name": "High Availability Multi-Region", "priceDelta": 800}
                ])
            ),
            (
                "PROD-003", "Insight Analytics Engine", "Add-on", 1200.0, 300.0,
                "Cohort retention, MRR movements and churn dynamic forecasting.", "Active",
                json.dumps([
                    {"id": "VAR-006", "name": "Standard Reporting Pack", "priceDelta": 0},
                    {"id": "VAR-007", "name": "AI Forecast Module", "priceDelta": 400}
                ])
            ),
            (
                "PROD-004", "Priority 24/7 SLA Support", "Service", 800.0, 250.0,
                "Guaranteed 1-hour ticket response and assigned technical manager.", "Active",
                json.dumps([
                    {"id": "VAR-008", "name": "Standard Business Hours", "priceDelta": 0},
                    {"id": "VAR-009", "name": "24/7 Mission-Critical SLA", "priceDelta": 600}
                ])
            ),
        ]
        cur.executemany("""
            INSERT INTO products (
                id, name, type, sales_price, cost_price, notes, status, variants_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, sample_products)

    # Seed Plans if empty
    cur.execute("SELECT COUNT(*) FROM plans;")
    if cur.fetchone()[0] == 0:
        sample_plans = [
            ("PLAN-001", "Starter Plan", "starter", 1200.0, "Monthly", 1, "2024-01-01", "2025-12-31", 0, 1, 1, 1, "Designed for small boutique shops needing clean subscription billing."),
            ("PLAN-002", "Growth Plan", "growth", 2000.0, "Monthly", 3, "2024-01-01", "2025-12-31", 0, 1, 1, 1, "Optimal for scaling teams with multi-seat CRM and recurring add-ons."),
            ("PLAN-003", "Scale Plan", "scale", 5000.0, "Monthly", 5, "2024-01-01", "2025-12-31", 0, 1, 1, 1, "Full feature access with high-capacity API limits and priority SLA."),
            ("PLAN-004", "Enterprise Annual", "enterprise", 48000.0, "Yearly", 10, "2024-01-01", "2026-12-31", 1, 0, 0, 0, "Mission-critical infrastructure plan with custom SLA and security review."),
        ]
        cur.executemany("""
            INSERT INTO plans (
                id, name, code, price, billing_frequency, min_quantity,
                start_date, end_date, auto_close_on_end, allow_early_termination,
                allow_pause, auto_renew, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, sample_plans)

    # Seed Subscriptions if empty
    cur.execute("SELECT COUNT(*) FROM subscriptions;")
    if cur.fetchone()[0] == 0:
        sample_subscriptions = [
            (
                "SUB-2024-001", "SUB/2024/001", "CUST-001", "Rohan Mehta", "PLAN-003", "Scale Plan",
                "Active", "2024-09-12", "2025-09-11", "Net 30",
                json.dumps([{"productId": "PROD-001", "productName": "Brightloop CRM Core", "quantity": 5, "unitPrice": 2560, "total": 12800}]),
                12800.0, 1
            ),
            (
                "SUB-2024-002", "SUB/2024/002", "CUST-002", "Ananya Iyer", "PLAN-002", "Growth Plan",
                "Active", "2024-09-04", "2025-09-03", "Immediate",
                json.dumps([{"productId": "PROD-001", "productName": "Brightloop CRM Core", "quantity": 3, "unitPrice": 2000, "total": 6000}]),
                6000.0, 1
            ),
            (
                "SUB-2024-003", "SUB/2024/003", "CUST-003", "Arjun Nair", "PLAN-004", "Enterprise Annual",
                "Active", "2024-08-28", "2025-08-27", "Net 45",
                json.dumps([{"productId": "PROD-002", "productName": "Cloud ERP Suite", "quantity": 10, "unitPrice": 4500, "total": 45000}]),
                45000.0, 0
            ),
        ]
        cur.executemany("""
            INSERT INTO subscriptions (
                id, number, customer_id, customer_name, plan_id, plan_name,
                status, start_date, expiry_date, payment_terms, lines_json,
                total_amount, auto_renew
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, sample_subscriptions)

    # Seed Invoices if empty
    cur.execute("SELECT COUNT(*) FROM invoices;")
    if cur.fetchone()[0] == 0:
        sample_invoices = [
            (
                "INV-2024-1001", "INV-2048", "SUB-2024-001", "CUST-001", "Rohan Mehta",
                "2024-10-31", "2024-11-30", "Paid",
                json.dumps([{"desc": "Scale Plan CRM Core (5 seats)", "qty": 5, "price": 2560, "amount": 12800}]),
                12800.0, 2304.0, 15104.0, 15104.0
            ),
            (
                "INV-2024-1002", "INV-2047", "SUB-2024-002", "CUST-002", "Ananya Iyer",
                "2024-10-30", "2024-11-15", "Paid",
                json.dumps([{"desc": "Growth Plan CRM (3 seats)", "qty": 3, "price": 2000, "amount": 6000}]),
                6000.0, 1080.0, 7080.0, 7080.0
            ),
            (
                "INV-2024-1003", "INV-2046", "SUB-2024-003", "CUST-003", "Arjun Nair",
                "2024-10-29", "2024-11-28", "Confirmed",
                json.dumps([{"desc": "Enterprise ERP Suite", "qty": 10, "price": 4500, "amount": 45000}]),
                45000.0, 8100.0, 53100.0, 0.0
            ),
        ]
        cur.executemany("""
            INSERT INTO invoices (
                id, invoice_number, subscription_id, customer_id, customer_name,
                date, due_date, status, lines_json, subtotal, tax_amount, total, paid_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, sample_invoices)

    # Seed Payments if empty
    cur.execute("SELECT COUNT(*) FROM payments;")
    if cur.fetchone()[0] == 0:
        sample_payments = [
            ("PAY-2024-001", "PAY-9041", "INV-2024-1001", "CUST-001", "Rohan Mehta", 15104.0, "Bank Transfer", "2024-10-31", "HDFC NEFT Ref #889210", "Success"),
            ("PAY-2024-002", "PAY-9040", "INV-2024-1002", "CUST-002", "Ananya Iyer", 7080.0, "Credit Card", "2024-10-30", "Stripe auth_ch_9921", "Success"),
        ]
        cur.executemany("""
            INSERT INTO payments (
                id, payment_number, invoice_id, customer_id, customer_name,
                amount, method, date, notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, sample_payments)

    # Seed Discounts if empty
    cur.execute("SELECT COUNT(*) FROM discounts;")
    if cur.fetchone()[0] == 0:
        sample_discounts = [
            ("DISC-001", "BRIGHT10", "10% High Volume Partner", "percentage", 10.0, 5000.0, 3, 100, 14, "2024-01-01", "2025-12-31", 1, "all"),
            ("DISC-002", "ODOOFLAT500", "₹500 Odoo Migration Rebate", "fixed", 500.0, 2000.0, 1, 50, 8, "2024-01-01", "2025-12-31", 1, "PROD-001"),
        ]
        cur.executemany("""
            INSERT INTO discounts (
                id, code, name, type, value, min_purchase, min_quantity,
                max_uses, current_uses, start_date, end_date, active, applies_to
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, sample_discounts)

    conn.commit()
    conn.close()


# Database helper query functions
def get_todos() -> list[dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT id, name, completed, created_at FROM todos ORDER BY id DESC;").fetchall()
    conn.close()
    return [{"id": r["id"], "name": r["name"], "completed": bool(r["completed"]), "created_at": r["created_at"]} for r in rows]


def create_todo(name: str) -> dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO todos (name) VALUES (?);", (name,))
    conn.commit()
    new_id = cur.lastrowid
    row = conn.execute("SELECT id, name, completed, created_at FROM todos WHERE id = ?;", (new_id,)).fetchone()
    conn.close()
    return {"id": row["id"], "name": row["name"], "completed": bool(row["completed"]), "created_at": row["created_at"]}


def toggle_todo(todo_id: int) -> dict[str, Any] | None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE todos SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END WHERE id = ?;", (todo_id,))
    conn.commit()
    row = conn.execute("SELECT id, name, completed, created_at FROM todos WHERE id = ?;", (todo_id,)).fetchone()
    conn.close()
    if not row:
        return None
    return {"id": row["id"], "name": row["name"], "completed": bool(row["completed"]), "created_at": row["created_at"]}


def delete_todo(todo_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM todos WHERE id = ?;", (todo_id,))
    conn.commit()
    deleted = cur.rowcount > 0
    conn.close()
    return deleted


def get_all_customers() -> list[dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM customers ORDER BY joined DESC;").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_db_stats() -> dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()
    stats = {}
    for table in ["todos", "customers", "products", "plans", "subscriptions", "invoices", "payments", "discounts"]:
        cur.execute(f"SELECT COUNT(*) FROM {table};")
        stats[table] = cur.fetchone()[0]
    conn.close()
    return {
        "engine": "SQLite 3",
        "databaseFile": str(DB_PATH),
        "tableCounts": stats,
        "status": "connected"
    }
