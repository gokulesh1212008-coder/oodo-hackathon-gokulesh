# Brightloop Python backend

The backend uses only Python's standard library and SQLite. It stores customer records
in `backend/brightloop.db` and creates the starter dashboard data on first launch.

```powershell
python backend\server.py
```

The API listens on `http://127.0.0.1:8000` and exposes:

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/customers?q=<search>&limit=<1-100>&offset=<n>`
- `GET /api/customers/<id>`
- `POST /api/customers` — create a customer (`name`, `email`, optional `company`)
- `PATCH /api/customers/<id>` — update customer fields
- `DELETE /api/customers/<id>`

The customer collection response includes matching records, total count, and status
summary. Customer creation validates inputs and rejects duplicate email addresses.
The Vite development server proxies `/api` requests to this service.

Set `BRIGHTLOOP_DB_PATH` to use a different SQLite file, or set `BRIGHTLOOP_HOST`
and `BRIGHTLOOP_PORT` to change the bind address and port.

Run API tests with:

```powershell
python -m unittest discover -s backend -p "test_*.py"
```
