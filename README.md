# IT Support Desk

A multi-office IT support ticketing system: employees report problems, IT staff
work assigned tickets, and the boss/admin assigns work and tracks status across
the whole team.

## Stack
- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express + Sequelize
- **Database:** MySQL 8
- **Auth:** JWT + bcrypt, role-based (`employee`, `it_staff`, `admin`)
- **Orchestration:** Docker Compose

## Roles
| Role       | Can do |
|------------|--------|
| `employee` | Register/login, submit tickets, see status of their own tickets |
| `it_staff` | See tickets assigned to them, update status, add resolution notes |
| `admin`    | See all tickets and stats, assign tickets to IT staff, create IT/admin accounts |

## Run it

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- MySQL: localhost:3306

On first boot the backend auto-creates the database tables and seeds an admin
account from the environment variables in `docker-compose.yml`:

```
ADMIN_EMAIL: admin@company.com
ADMIN_PASSWORD: Admin123!
```

Log in with those credentials to reach the admin dashboard, then use
**"+ Add IT staff"** there to create IT staff accounts (and additional admins).
Employees create their own accounts via the **Register** page.

**Change `ADMIN_PASSWORD` and `JWT_SECRET` before using this anywhere beyond your
own machine.**

## Typical flow
1. Employee registers/logs in → submits a ticket (title, description, category, priority).
2. Admin logs in → sees the new ticket on the dashboard → assigns it to an IT staff member.
3. IT staff logs in → sees the ticket under "Assigned to Me" → updates status
   (`assigned` → `in_progress` → `resolved` → `closed`) and adds resolution notes.
4. Employee sees the live status and resolution notes on their own dashboard.
5. Admin can filter by status and see ticket counts at a glance.

## API overview
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | anyone | create employee account |
| POST | `/api/auth/login` | anyone | login |
| GET  | `/api/auth/me` | authenticated | current user |
| POST | `/api/tickets` | authenticated | create ticket |
| GET  | `/api/tickets` | authenticated | list tickets (scoped by role) |
| GET  | `/api/tickets/:id` | owner/assignee/admin | ticket detail |
| PUT  | `/api/tickets/:id/assign` | admin | assign to IT staff |
| PUT  | `/api/tickets/:id/status` | it_staff/admin | update status/notes |
| GET  | `/api/tickets/stats/overview` | admin | dashboard counts |
| GET  | `/api/users?role=it_staff` | admin | list IT staff |
| POST | `/api/users` | admin | create IT staff/admin account |

## Local dev without Docker
Each service can also run standalone if you have Node 20+ and MySQL installed:

```bash
# backend
cd backend
cp .env.example .env   # edit values to match your local MySQL
npm install
npm run dev

# frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## Where to extend next
- Email/Slack notifications on assignment or status change
- File attachments on tickets (screenshots, logs)
- Per-office ticket routing / auto-assignment
- SLA timers and overdue alerts
- Audit log of status changes
