# Brightloop Database & Backend Engine

The backend uses Python's standard library and built-in SQLite3 engine for zero-dependency persistent storage.

## Starting the Server
```powershell
python backend\server.py
```

The database `backend/brightloop.db` is created and seeded automatically on first launch.

## Available REST Endpoints

### System & Health
- `GET /api/health` — Service health and database connection status
- `GET /api/db/stats` — SQLite engine stats and table record counts
- `GET /api/dashboard` — Unified MRR, subscription metrics, and performance chart data

### Customers
- `GET /api/customers?q=<search>&limit=<1-100>&offset=<n>` — Filtered customer list with pagination
- `GET /api/customers/<id>` — Retrieve single customer record
- `POST /api/customers` — Create a new customer (`name`, `email`, optional `company`)
- `PATCH /api/customers/<id>` — Update customer fields (`name`, `email`, `company`, `plan`, `status`)
- `DELETE /api/customers/<id>` — Remove a customer

### Todos & Tasks Ledger (SQLite & Supabase Compatible)
- `GET /api/todos` — Returns list of persistent todos
- `POST /api/todos` — Inserts a new todo (`name`)
- `POST /api/todos/<id>/toggle` — Toggles completion status
- `DELETE /api/todos/<id>` — Deletes a todo item

## Running Backend Tests
```powershell
python -m unittest discover -s backend -p "test_*.py"
```

## Cloud Supabase Integration (PostgreSQL)

For Supabase deployment:
1. Open your Supabase Dashboard: `https://supabase.com/dashboard`
2. Open the **SQL Editor**
3. Run the complete migration script provided in `backend/supabase_schema.sql` (configured with password `Jaswanth1617`)
4. Copy your **Project URL** and **Anon Public Key** into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. The frontend client in `src/utils/supabase.js` will automatically route `supabase.from('todos').select()` to your Supabase PostgreSQL cloud table, while seamlessly falling back to local SQLite if offline!
