# Quick Start Guide

## Prerequisites
- Docker Desktop installed and running
- (Optional) OpenAI API key
- (Optional) Anthropic API key

## Steps

1. **Setup environment variables**
   - Copy `.env.example` to `.env`
   - Edit `.env` and add your API keys (optional, but required for LLM execution)

2. **Start the application**
   
   **On Windows:**
   \`\`\`bash
   start.bat
   \`\`\`
   
   **On Linux/Mac:**
   \`\`\`bash
   chmod +x start.sh
   ./start.sh
   \`\`\`
   
   **Or manually:**
   \`\`\`bash
   docker-compose up --build
   \`\`\`

3. **Create a superuser** (in a new terminal)
   \`\`\`bash
   docker-compose exec backend python manage.py createsuperuser
   \`\`\`

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Django Admin: http://localhost:8000/admin

## Common Commands

\`\`\`bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Access backend shell
docker-compose exec backend python manage.py shell

# Run migrations
docker-compose exec backend python manage.py migrate
\`\`\`

## Troubleshooting

**Port already in use:**
- Change ports in `docker-compose.yml`
- Or stop the conflicting service

**Database connection errors:**
- Wait a few seconds for PostgreSQL to start
- Check `docker-compose logs db`

**Frontend not loading:**
- Check `docker-compose logs frontend`
- Ensure backend is running first

## Default Credentials

After creating a superuser, use those credentials to:
1. Login to Django Admin (/admin)
2. Login to the Frontend (/login)

## Network Information

The application uses a Docker network named `promt-library-1` where all services communicate:
- `db` - PostgreSQL on port 5432
- `redis` - Redis on port 6379
- `backend` - Django on port 8000
- `celery` - Celery worker
- `frontend` - Next.js on port 3000
