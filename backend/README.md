# Brightloop Database & Backend Engine

The backend uses Python's standard library and built-in SQLite3 engine for zero-dependency persistent storage.

## Starting the Server
```powershell
python backend\server.py
```

The database `backend/database.db` is created and seeded automatically on first startup.

## Available REST Endpoints

- `GET /api/health` - Health status and database engine statistics
- `GET /api/db/stats` - Table row counts across todos, customers, subscriptions, invoices, etc.
- `GET /api/todos` - Returns persistent todo items
- `POST /api/todos` - Creates a new persistent todo item
- `POST /api/todos/<id>/toggle` - Toggles completion status of a todo
- `DELETE /api/todos/<id>` - Removes a todo from SQLite
- `GET /api/dashboard` - Unified MRR, subscription metrics, transactions, and live customer stats
- `GET /api/customers` - Returns customer records
- `POST /api/customers` - Creates a new customer record

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
