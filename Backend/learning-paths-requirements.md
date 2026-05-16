# Learning Paths Backend Requirements

## Purpose
Enable teachers to create, update, delete, and publish learning paths that guide students through structured milestones and resources.

## API Endpoints

### GET /learning-paths
- Public endpoint.
- Returns all learning paths.
- Supports query parameters:
  - `level` — filter by learning level (PSLC, JCE, MSCE)
  - `subject` — partial subject match
  - `teacher_email` — filter by creator
  - `search` — text search over title, subject, or description

### GET /learning-paths/:id
- Public endpoint.
- Returns a single learning path by ID.

### POST /learning-paths
- Requires authentication.
- Allowed roles: `Admin`, `Teacher`.
- Creates a learning path and automatically associates it with the authenticated teacher email.

### PATCH /learning-paths/:id
- Requires authentication.
- Allowed roles: `Admin`, `Teacher`.
- Updates any editable field on an existing learning path.

### DELETE /learning-paths/:id
- Requires authentication.
- Allowed roles: `Admin`, `Teacher`.
- Removes the learning path.

## Data Model

### learning_paths table
- `id` — UUID primary key
- `title` — string, required
- `subject` — string, required
- `level` — string, required
- `description` — text, optional
- `milestones` — JSON array of milestone objects
- `teacher_email` — string, optional
- `createdAt` — timestamp
- `updatedAt` — timestamp

### Milestone object schema
- `title` — string, required
- `description` — string, optional
- `resource_ids` — array of string resource IDs, optional
- `order` — integer sequence value, optional

## Frontend Integration
- Add a teacher dashboard route at `/teacher/learning-paths`.
- Show a sidebar entry and dashboard card for Learning Paths.
- Use local API calls instead of Base44 for both student and teacher experiences.
- Student-facing learning paths should be available at `/learning-paths`.

## Security and Access
- Public read access so students can browse learning paths.
- Teacher/Admin only write access for creation, editing, and deletion.
- Teacher API requests should automatically attach the authenticated teacher email for ownership.

## Notes
- The backend should be added as a standard NestJS module with a controller, service, DTOs, and entity.
- The entity should be registered in `AppModule` and included in TypeORM entity configuration.
