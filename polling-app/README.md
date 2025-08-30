This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

Before using the poll creation feature, you need to set up the database tables in Supabase:

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run the schema from `database-schema.sql`**:
   ```sql
   -- Copy and paste the contents of database-schema.sql
   -- This creates the polls and poll_options tables
   ```

**Required Tables:**
- `polls(id, question, created_at, updated_at)`
- `poll_options(id, poll_id, label, idx, created_at)`

**Note:** The schema includes Row Level Security (RLS) policies and proper indexing for performance.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Rules & Architecture

This project follows strict architectural patterns defined in `.cursorrules` to ensure consistency, security, and performance:

### **Data Fetching Pattern**
- **App Router + Server Components** for all data fetching operations
- Never use `useEffect` to fetch page data in client components
- Fetch data directly in Server Components using Supabase

### **Form Mutations Pattern**
- **Server Actions** for all form submissions and data mutations
- Forms must use native `<form action={serverAction}>` syntax
- Never call Server Actions from client `onSubmit` handlers
- Never use `/api/*` routes for core mutations

### **Supabase Client Architecture**
- **Server Code**: Import and use `@/lib/supabase-server` only
- **Client Code**: Use `@/lib/supabase-browser` for auth/session UI only
- Never instantiate browser client in Server Actions or Server Components
- All secrets loaded from environment variables (`.env.local`)

### **UI Component Standards**
- **shadcn/ui** components for all form elements (`Button`, `Card`, `Input`, `Label`)
- Semantic labels with proper `htmlFor` attributes
- Inline error messages and validation feedback
- Disabled states during form submission

### **Cache Management**
- **Revalidate after mutations** using `revalidatePath()` for affected routes
- Ensures UI stays in sync with database changes
- Automatic cache invalidation for real-time updates

## How We Used AI

This project was developed with AI assistance following a structured approach:

### **Rule Enforcement**
- **`.cursorrules`** file defines strict architectural patterns
- AI continuously audits code against these rules
- Automatic detection of anti-patterns and violations

### **Refactor Loop**
- **Compliance Audits**: Regular checks against `.cursorrules`
- **Violation Detection**: Identifies non-compliant code patterns
- **Systematic Refactoring**: Step-by-step fixes to achieve compliance
- **Verification**: Final compliance checklist confirmation

### **Development Workflow**
1. **Define Rules**: Establish patterns in `.cursorrules`
2. **AI Development**: Generate code following established patterns
3. **Compliance Audit**: Check against rules using built-in prompts
4. **Refactor & Fix**: Address violations systematically
5. **Verify**: Confirm 100% compliance before merging

This approach ensures consistent architecture, prevents technical debt, and maintains high code quality standards across the entire project.
