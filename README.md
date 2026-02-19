# Prompt Library

A full-stack application for managing and executing LLM prompts with version control, analytics, and multi-provider support.

## Features

- 📝 **Prompt Management**: Create, version, and organize prompts with templates
- 🚀 **Multi-Provider Execution**: Execute prompts using OpenAI and Anthropic APIs
- 📊 **Analytics Dashboard**: Track performance, costs, and usage metrics
- 🔐 **Authentication**: Secure user authentication with JWT
- 🏷️ **Version Control**: Track and rollback prompt versions
- ⭐ **Favorites**: Save and organize favorite prompts
- 📈 **Cost Tracking**: Monitor token usage and API costs

## Tech Stack

### Backend
- Django 4.2 with Django REST Framework
- PostgreSQL database
- Redis for caching and Celery
- Celery for async task processing
- OpenAI & Anthropic API integration

### Frontend
- Next.js 16 (Latest - App Router)
- React 19
- TypeScript
- TailwindCSS 4 for styling
- React Query for data fetching
- Zustand for state management

## Getting Started

### Prerequisites

- Docker and Docker Compose
- OpenAI API Key (optional)
- Anthropic API Key (optional)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd prompt-library
\`\`\`

2. Copy the environment file and update with your API keys:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Edit `.env` and add your API keys:
\`\`\`
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
\`\`\`

4. Start the application with Docker Compose:
\`\`\`bash
docker-compose up --build
\`\`\`

5. Create a superuser for Django admin:
\`\`\`bash
docker-compose exec backend python manage.py createsuperuser
\`\`\`

6. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Django Admin: http://localhost:8000/admin

## Project Structure

```
prompt-library/
├── Backend/                    # Django backend
│   ├── apps/
│   │   ├── prompts/           # Prompt management
│   │   ├── execution/         # LLM execution
│   │   ├── analytics/         # Analytics & metrics
│   │   └── audit/             # Audit logging
│   ├── config/                # Django configuration
│   │   ├── settings/          # Settings (base, dev, prod)
│   │   ├── urls.py
│   │   └── celery.py
│   ├── common/                # Shared utilities
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # Next.js 16 frontend (latest)
│   ├── app/                   # App router pages
│   │   ├── login/            # Login page
│   │   ├── dashboard/        # Dashboard page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── providers.tsx     # React Query provider
│   ├── lib/                   # Utilities & API
│   │   ├── api.ts            # Axios client
│   │   └── store/            # Zustand stores
│   ├── types/                 # TypeScript types
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml         # Docker orchestration
\`\`\`

## API Documentation

### Authentication
- \`POST /api/token/\` - Obtain JWT token
- \`POST /api/token/refresh/\` - Refresh JWT token

### Prompts
- \`GET /api/prompts/\` - List all prompts
- \`POST /api/prompts/\` - Create a new prompt
- \`GET /api/prompts/{id}/\` - Get prompt details
- \`PUT /api/prompts/{id}/\` - Update prompt
- \`DELETE /api/prompts/{id}/\` - Delete prompt
- \`POST /api/prompts/{id}/create_version/\` - Create new version
- \`POST /api/prompts/{id}/favorite/\` - Add to favorites

### Execution
- \`GET /api/execution/\` - List executions
- \`POST /api/execution/\` - Execute a prompt
- \`GET /api/execution/{id}/\` - Get execution details
- \`GET /api/execution/providers/\` - List available providers

### Analytics
- \`GET /api/analytics/dashboard/\` - Get dashboard metrics
- \`GET /api/analytics/trends/\` - Get daily trends
- \`GET /api/analytics/top_prompts/\` - Get top prompts
- \`GET /api/analytics/cost_analysis/\` - Get cost analysis

## Development

### Backend Development

\`\`\`bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access Django shell
docker-compose exec backend python manage.py shell

# Run tests
docker-compose exec backend python manage.py test
\`\`\`

### Frontend Development

\`\`\`bash
# Install dependencies
cd Frontend
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

## Docker Network

The application runs on a custom Docker network named \`promt-library-1\` with the following services:

- **db**: PostgreSQL database
- **redis**: Redis for Celery
- **backend**: Django API server
- **celery**: Celery worker for async tasks
- **frontend**: Next.js frontend

## Environment Variables

### Backend
- \`DJANGO_SECRET_KEY\`: Django secret key
- \`DJANGO_DEBUG\`: Debug mode (True/False)
- \`DB_NAME\`, \`DB_USER\`, \`DB_PASSWORD\`, \`DB_HOST\`, \`DB_PORT\`: Database configuration
- \`REDIS_URL\`: Redis connection URL
- \`OPENAI_API_KEY\`: OpenAI API key
- \`ANTHROPIC_API_KEY\`: Anthropic API key
- \`CORS_ALLOWED_ORIGINS\`: Allowed CORS origins

### Frontend
- \`NEXT_PUBLIC_API_URL\`: Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
