# Components Documentation

## PollForm

A React Hook Form-based component for creating polls with validation and Server Action integration.

### Features

- **Form Validation**: Uses Zod schema for robust validation
- **Dynamic Options**: Add/remove poll options (2-10 options)
- **Real-time Validation**: Inline error messages and validation feedback
- **Loading States**: Disabled states during form submission
- **Server Action Integration**: Calls `createPoll` Server Action on submit
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS

### Usage

```tsx
import { PollForm } from '@/components/PollForm'

export default function CreatePollPage() {
  return (
    <div>
      <h1>Create New Poll</h1>
      <PollForm />
    </div>
  )
}
```

### Validation Rules

- **Question**: 10-200 characters required
- **Options**: 2-10 options, each 2-100 characters
- **Uniqueness**: All options must be unique
- **Authentication**: User must be logged in

### Dependencies

- `react-hook-form` for form management
- `zod` for schema validation
- `@hookform/resolvers/zod` for integration
- `react-hot-toast` for notifications
- `lucide-react` for icons
- `shadcn/ui` components

### Server Action

The form calls `createPoll(formData: FormData)` from `@/lib/actions/polls` which:
- Validates input data
- Inserts poll into Supabase database
- Handles errors gracefully
- Revalidates dashboard cache
- Returns success/error status

### Database Schema

Requires a `polls` table with:
- `id` (UUID, primary key)
- `question` (TEXT)
- `options` (JSONB array of objects with text and votes)
- `user_id` (UUID, foreign key to auth.users)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

See `database-schema.sql` for complete setup instructions.
