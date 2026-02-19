# Makefile for Prompt Library

.PHONY: help build up down restart logs shell-backend shell-frontend migrate createsuperuser test clean

help:
	@echo "Prompt Library - Available Commands:"
	@echo "  make build          - Build all Docker containers"
	@echo "  make up             - Start all services"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-backend   - View backend logs"
	@echo "  make logs-frontend  - View frontend logs"
	@echo "  make shell-backend  - Access backend shell"
	@echo "  make shell-frontend - Access frontend shell"
	@echo "  make migrate        - Run Django migrations"
	@echo "  make createsuperuser- Create Django superuser"
	@echo "  make test           - Run backend tests"
	@echo "  make clean          - Remove containers and volumes"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

shell-backend:
	docker-compose exec backend python manage.py shell

shell-frontend:
	docker-compose exec frontend sh

migrate:
	docker-compose exec backend python manage.py migrate

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

test:
	docker-compose exec backend python manage.py test

clean:
	docker-compose down -v
	docker system prune -f
