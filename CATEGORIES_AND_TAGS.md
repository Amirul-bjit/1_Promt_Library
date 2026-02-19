# Categories & Tags System

## Overview
Categories and tags are **DYNAMIC** - they're stored in the database and can be created on-the-fly.

## Backend API

### Category Model
```python
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Tag Model
```python
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### API Endpoints

#### Categories
- `GET /api/prompts/categories/` - List all categories
- `POST /api/prompts/categories/` - Create new category
  ```json
  {"name": "Marketing", "description": "Marketing prompts"}
  ```
- `PUT /api/prompts/categories/{id}/` - Update category
- `DELETE /api/prompts/categories/{id}/` - Delete category

#### Tags
- `GET /api/prompts/tags/` - List all tags
- `POST /api/prompts/tags/` - Create new tag
  ```json
  {"name": "email"}
  ```
- `PUT /api/prompts/tags/{id}/` - Update tag
- `DELETE /api/prompts/tags/{id}/` - Delete tag

## Creating Templates with Auto-Create Feature

### Single API Call (Recommended)
```json
POST /api/prompts/templates/

{
    "title": "Email Generator",
    "description": "Generate professional emails",
    "category": "Marketing",        // Can be name OR ID
    "tags": ["email", "professional"],  // Can be names OR IDs
    "status": "active",             // "active" or "archived"
    "content": "Write a {{tone}} email about {{topic}}",
    "change_note": "Initial version"  // Optional
}
```

**What happens:**
1. If category "Marketing" exists → uses it
2. If not → creates new category "Marketing"
3. Same logic for tags
4. Creates template + first version
5. Auto-extracts variables: `["tone", "topic"]`

### Status Values
- Backend expects: `"active"` or `"archived"` (lowercase)
- Frontend now sends: `"active"` or `"archived"`

## Frontend Integration

### New Prompt Page Features
1. **Fetches existing categories/tags** on page load
2. **Autocomplete inputs** with datalist for category/tags
3. **Quick-add buttons** for existing tags
4. **Can type new names** - they'll be auto-created
5. **Loading state** while fetching data

### Usage
- User sees existing categories and can select or type new ones
- User sees existing tags with quick-add buttons
- Everything is created automatically if it doesn't exist

## Best Practices

### For Admins
- Pre-create common categories via admin panel or API
- Pre-create common tags to maintain consistency
- Regularly review and merge duplicate categories/tags

### For Users
- Check existing categories/tags before creating new ones
- Use autocomplete to see what exists
- Keep naming consistent (e.g., "Email Marketing" vs "email-marketing")

## Example Workflows

### First Time Setup
```bash
# Create initial categories
curl -X POST http://localhost:8000/api/prompts/categories/ \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Marketing"}'

curl -X POST http://localhost:8000/api/prompts/categories/ \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Development"}'

# Create common tags
curl -X POST http://localhost:8000/api/prompts/tags/ \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "email"}'
```

### Creating Template (No pre-setup needed)
```bash
# Everything auto-created!
curl -X POST http://localhost:8000/api/prompts/templates/ \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Prompt",
    "category": "AI",
    "tags": ["chatbot", "customer-service"],
    "content": "You are a {{role}} assistant",
    "status": "active"
  }'
```

## Migration Notes

### Old API Call (Won't work)
```json
{
    "status": "ACTIVE",  // ❌ Wrong - uppercase
    "content": "..."     // ❌ Not in original serializer
}
```

### New API Call (Works!)
```json
{
    "status": "active",  // ✅ Correct - lowercase
    "content": "..."     // ✅ Now supported!
}
```
