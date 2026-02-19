@echo off
REM Startup script for Prompt Library (Windows)

echo Starting Prompt Library...

REM Check if .env exists
if not exist .env (
    echo .env file not found. Copying from .env.example...
    copy .env.example .env
    echo .env file created. Please update it with your API keys.
    echo Edit .env file and add your OPENAI_API_KEY and ANTHROPIC_API_KEY
    pause
)

REM Build and start containers
echo Building Docker containers...
docker-compose build

echo Starting services...
docker-compose up -d

REM Wait for database to be ready
echo Waiting for database to be ready...
timeout /t 10 /nobreak

REM Run migrations
echo Running database migrations...
docker-compose exec -T backend python manage.py migrate

REM Collect static files
echo Collecting static files...
docker-compose exec -T backend python manage.py collectstatic --noinput

echo.
echo Application is starting!
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo Django Admin: http://localhost:8000/admin
echo.
echo To create a superuser, run:
echo    docker-compose exec backend python manage.py createsuperuser
echo.
echo View logs:
echo    docker-compose logs -f
echo.

REM Follow logs
docker-compose logs -f
