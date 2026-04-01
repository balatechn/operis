# Operis — Manufacturing Management System

A modern, end-to-end manufacturing management platform covering the full cycle:
**Procurement → Inventory → Production → Packing → Sales → Dispatch**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend API | NestJS + TypeScript |
| Database | PostgreSQL (Coolify managed) |
| Cache | Redis |
| Real-time | WebSockets (Socket.IO) |
| Deployment | Docker + Coolify |

---

## Modules

1. **Purchase & Receiving** — POs, Vendor management, GRN, QC approval
2. **Raw Materials** — Batch tracking, FIFO/FEFO, low stock & expiry alerts
3. **Recipes / BOM** — Bill of Materials with version control & cost calculation
4. **Production** — Orders, material issue, batch generation, wastage tracking
5. **Finished Goods** — SKU-wise stock, quality status, real-time visibility
6. **Packing** — Bulk-to-pack conversion, barcode generation, FG stock update
7. **Sales & Dispatch** — Sales orders, invoicing, stock reservation, dispatch

---

## Project Structure

```
Manufacturing/
├── web/          # Next.js frontend
├── backend/      # NestJS API backend
├── docker-compose.yml
└── .env.example
```

---

## Development Setup

### Backend
```bash
cd backend
cp .env.example .env   # fill in your DB values
npm install
npm run start:dev      # runs on http://localhost:4000
```

### Frontend
```bash
cd web
cp .env.example .env.local   # fill in API URL
npm install
npm run dev                   # runs on http://localhost:3000
```

### API Docs (Swagger)
```
http://localhost:4000/api/docs
```

---

## Coolify Deployment

1. Create a **PostgreSQL** service in Coolify — note the host, user, password, DB name
2. Create a **Redis** service in Coolify
3. Push this repository to GitHub (`balatechn/operis`)
4. In Coolify, create two services from GitHub:
   - **Backend**: Dockerfile path `backend/Dockerfile`, port `4000`
   - **Web**: Dockerfile path `web/Dockerfile`, port `3000`
5. Set environment variables in Coolify dashboard (use `.env.example` as reference)
6. Deploy — Coolify will auto-build on every push to `main`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `POSTGRES_HOST` | PostgreSQL host from Coolify |
| `POSTGRES_USER` | DB username |
| `POSTGRES_PASSWORD` | DB password |
| `POSTGRES_DB` | Database name (default: `operis`) |
| `JWT_SECRET` | Strong random secret for JWT tokens |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `NEXT_PUBLIC_API_URL` | Backend API URL for the web frontend |

---

## Default Login

After deployment, create the first admin user via the API:
```bash
POST /api/v1/users
{ "email": "admin@operis.com", "password": "...", "name": "Admin", "role": "admin" }
```

---

## License
MIT
