# Brightloop Python backend

The backend uses only Python's standard library.

```powershell
python backend\server.py
```

The API listens on `http://127.0.0.1:8000` and exposes:

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/customers`
- `POST /api/customers`

The Vite development server proxies `/api` requests to this service.
