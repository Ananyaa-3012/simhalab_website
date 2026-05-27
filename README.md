# SIMHA — Secure Intelligent Models and Hardware Architecture

Official website for SIMHA, under the Wadhwani School of Data Science and AI (WSAI), IIT Madras.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + React Router 6 |
| Backend | FastAPI (Python 3.11) |
| Database | SQLite (migration-ready for PostgreSQL) |
| Auth | Google OAuth 2.0 SSO + JWT + reCAPTCHA v3 |
| Flowcharts | React Flow |
| Containerization | Docker + docker-compose |
| Environment | Conda (`simha-website`) |

## Quick Start (Local Development)

### Prerequisites

- Node.js 22+
- Conda (Miniconda or Anaconda)
- Python 3.11+

### 1. Backend Setup

```bash
# Create and activate conda environment
conda env create -f environment.yml
conda activate simha-website

# Or install manually
cd backend
pip install -r requirements.txt

# Copy and configure environment variables
cp ../.env.example .env
# Edit .env with your values (defaults work for local dev)

# Seed the database with dummy data
python seed.py

# Start the backend
uvicorn app.main:app --reload --port 8000
```

API docs available at http://localhost:8000/api/docs

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend available at http://localhost:5173

### 3. Admin Panel

Navigate to http://localhost:5173/admin

**Dev login credentials:**
- Email: `admin@simha.iitm.ac.in`
- Password: `admin123`

To disable dev login in production, set `DEV_ADMIN_PASSWORD=` (empty) in `.env`.

## Project Structure

```
SIMHA_Website/
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ThemeToggle
│   │   ├── context/        # ThemeContext (dark/light)
│   │   ├── pages/          # 15 public page components
│   │   ├── admin/          # Admin login + dashboard
│   │   ├── styles/         # Global CSS with theme variables
│   │   └── utils/          # API client (axios)
│   └── package.json
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── auth/           # Google OAuth, JWT, reCAPTCHA
│   │   ├── models/         # SQLAlchemy models (20+ tables)
│   │   ├── routers/        # Public + Admin API routes
│   │   ├── middleware/     # Security headers
│   │   ├── schemas/        # Pydantic validation
│   │   └── utils/          # HTML sanitization, file upload
│   ├── seed.py             # Database seeder with dummy data
│   └── requirements.txt
├── assets/                 # Shared static assets (logos, placeholders)
├── config.json             # Site configuration
├── .env.example            # Environment variable template
├── environment.yml         # Conda environment spec
├── docker-compose.yml      # Production deployment
├── Dockerfile.backend
├── Dockerfile.frontend
└── nginx.conf              # Nginx config for production
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Carousel, announcements, lab head message, highlights |
| People | `/people` | Faculty, staff, students, alumni cards |
| Person Detail | `/people/:id` | Individual profile with publications |
| Research | `/research` | Research areas (zigzag layout) |
| Publications | `/publications` | Searchable, filterable, sortable table |
| Projects | `/projects` | Card grid with status/tag filters |
| News & Events | `/news-events` | Tabbed news and events |
| Blog | `/blog` | Article listing |
| Blog Post | `/blog/:slug` | Individual article |
| Join Us | `/join-us` | Interactive flowcharts + openings |
| Gallery | `/gallery` | Image grid with hover info + lightbox |
| Links | `/links` | External resources |
| Sponsors | `/sponsors` | Collaborator logos |
| Testimonials | `/testimonials` | Quotes from members |
| Contact | `/contact` | Contact form + map |
| Admin | `/admin` | Login page |
| Dashboard | `/admin/dashboard` | CRUD for all content |

## Configuration

### Environment Variables (`.env`)

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT signing key |
| `DATABASE_URL` | SQLAlchemy connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `ALLOWED_ADMIN_EMAILS` | Comma-separated admin emails |
| `RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 site key |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v3 secret key |
| `DEV_ADMIN_PASSWORD` | Dev login password (empty to disable) |
| `CORS_ORIGINS` | Allowed frontend origins |

### Site Config (`config.json`)

Non-secret site metadata: name, institution, contact details, social links.

## Theme

Supports dark/light mode toggle. Color palette:

| Color | Hex | Role |
|-------|-----|------|
| Gold | `#ffde00` | Primary / CTAs |
| Amber | `#ea990b` | Secondary / Hover |
| Tan | `#d6b860` | Tertiary / Borders |
| Camel | `#c19a6b` | Warm neutral |
| Black | `#000000` | Navbar / Footer |

## Production Deployment

```bash
# Build and start containers
docker-compose up --build -d

# Frontend served on port 80, backend on 8000
```

Ensure you:
1. Set strong `SECRET_KEY` in `.env`
2. Configure Google OAuth credentials
3. Set `DEV_ADMIN_PASSWORD=` (empty) to disable dev login
4. Set `CORS_ORIGINS` to your production domain
5. Enable HTTPS via reverse proxy or load balancer

## Security

- Google OAuth 2.0 (no passwords stored)
- JWT with httpOnly, Secure, SameSite=Strict cookies
- Token rotation on refresh
- Google reCAPTCHA v3 on login + contact form
- Rate limiting (slowapi)
- Input validation (Pydantic) + HTML sanitization (bleach)
- CSP, X-Frame-Options, HSTS security headers
- File upload validation (magic bytes, size limits, UUID filenames)
- SQLAlchemy ORM (parameterized queries only)
- CORS whitelist

## License

Internal project — IIT Madras.
