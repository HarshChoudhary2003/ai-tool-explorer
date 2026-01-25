# AI Tools Explorer - Developer Guide

<div align="center">
  <h3>💻 Technical Documentation for Developers</h3>
  <p>Architecture, setup, and contribution guidelines</p>
</div>

---

## 📖 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Local Development Setup](#local-development-setup)
4. [Project Structure](#project-structure)
5. [Component Guidelines](#component-guidelines)
6. [State Management](#state-management)
7. [Database Integration](#database-integration)
8. [Authentication](#authentication)
9. [Styling Guidelines](#styling-guidelines)
10. [Testing](#testing)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8+ | Type safety |
| Vite | 5.4+ | Build tool & dev server |
| React Router | 6.x | Client-side routing |
| TanStack Query | 5.x | Server state management |
| Framer Motion | 12.x | Animations |
| Tailwind CSS | 3.4+ | Utility-first styling |
| Shadcn/ui | Latest | UI component library |
| Radix UI | Latest | Accessible primitives |

### Backend

| Technology | Purpose |
|-----------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Edge Functions | Serverless compute |
| Row Level Security | Data protection |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │    React    │  │  React      │  │  Tailwind   │          │
│  │  Components │  │  Router     │  │    CSS      │          │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘          │
│         │                │                                   │
│         ▼                ▼                                   │
│  ┌─────────────────────────────────┐                        │
│  │      Custom Hooks & Context      │                        │
│  │  useAuth, useBookmarks, useTheme │                        │
│  └──────────────┬──────────────────┘                        │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────────┐                        │
│  │    TanStack Query + Supabase    │                        │
│  │         Client SDK              │                        │
│  └──────────────┬──────────────────┘                        │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  PostgreSQL │  │  Supabase   │  │    Edge     │          │
│  │  Database   │  │    Auth     │  │  Functions  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │           Row Level Security (RLS)               │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → React Component
2. **Component** → Custom Hook / TanStack Query
3. **Query/Mutation** → Supabase Client
4. **Supabase Client** → PostgreSQL (via RLS)
5. **Response** → Component State → UI Update

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Git
- Code editor (VS Code recommended)

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/your-repo/ai-tools-explorer.git
cd ai-tools-explorer

# 2. Install dependencies
npm install
# or
bun install

# 3. Create environment file
cp .env.example .env

# 4. Add Supabase credentials to .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# 5. Start development server
npm run dev
# or
bun dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui base components
│   ├── Header.tsx       # Site header
│   ├── Footer.tsx       # Site footer
│   ├── ToolCard.tsx     # Tool display card
│   └── ...
├── pages/               # Route page components
│   ├── Index.tsx        # Homepage
│   ├── Tools.tsx        # Tool directory
│   ├── ToolDetails.tsx  # Single tool view
│   ├── Compare.tsx      # Tool comparison
│   ├── Admin.tsx        # Admin panel
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx      # Authentication
│   ├── useBookmarks.tsx # Bookmark management
│   ├── useTheme.tsx     # Theme switching
│   └── ...
├── integrations/        # External integrations
│   └── supabase/
│       ├── client.ts    # Supabase client (auto-generated)
│       └── types.ts     # Database types (auto-generated)
├── lib/                 # Utility functions
│   └── utils.ts         # Helper functions
├── data/                # Static data
│   └── categoryData.ts  # Category metadata
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

---

## 🧩 Component Guidelines

### Component Structure

```tsx
// ComponentName.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export function ComponentName({ title, onAction }: ComponentProps) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="glass p-4 rounded-xl">
      <h2 className="text-lg font-bold">{title}</h2>
      <Button onClick={onAction} disabled={loading}>
        Action
      </Button>
    </div>
  );
}
```

### Best Practices

1. **Use TypeScript interfaces** for all props
2. **Import paths** use `@/` alias
3. **Styling** uses Tailwind utility classes
4. **State** is managed locally or via hooks
5. **Data fetching** uses TanStack Query or Supabase client

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.tsx`
- Utilities: `camelCase.ts`
- Pages: `PascalCase.tsx`

---

## 🗄️ State Management

### Local State

```tsx
const [value, setValue] = useState<string>("");
```

### Server State (TanStack Query)

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ["tools"],
  queryFn: async () => {
    const { data } = await supabase.from("ai_tools").select("*");
    return data;
  },
});

// Mutations
const mutation = useMutation({
  mutationFn: async (newTool) => {
    const { data } = await supabase.from("ai_tools").insert(newTool);
    return data;
  },
});
```

### Context (Global State)

```tsx
// hooks/useAuth.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

---

## 🔌 Database Integration

### Supabase Client

```tsx
import { supabase } from "@/integrations/supabase/client";

// SELECT
const { data, error } = await supabase
  .from("ai_tools")
  .select("*")
  .eq("category", "llm")
  .order("rating", { ascending: false });

// INSERT
const { data, error } = await supabase
  .from("ai_tools")
  .insert({ name: "New Tool", ... });

// UPDATE
const { data, error } = await supabase
  .from("ai_tools")
  .update({ rating: 4.5 })
  .eq("id", toolId);

// DELETE
const { error } = await supabase
  .from("ai_tools")
  .delete()
  .eq("id", toolId);
```

### Type Safety

```tsx
import { Database } from "@/integrations/supabase/types";

type Tool = Database["public"]["Tables"]["ai_tools"]["Row"];
type ToolCategory = Database["public"]["Enums"]["tool_category"];
```

### Calling Edge Functions

```tsx
const { data, error } = await supabase.functions.invoke("recommend-tools", {
  body: { task: "image generation", budget: "free" },
});
```

---

## 🔐 Authentication

### Auth Context Usage

```tsx
import { useAuth } from "@/hooks/useAuth";

function Component() {
  const { user, signIn, signOut, isAdmin } = useAuth();

  if (!user) {
    return <LoginPrompt />;
  }

  return <UserContent user={user} />;
}
```

### Protected Routes

```tsx
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" />;
  
  return children;
}
```

### Admin Check

```tsx
const { isAdmin } = useAuth();

if (!isAdmin) {
  return <AccessDenied />;
}
```

---

## 🎨 Styling Guidelines

### Design Tokens

Use semantic tokens from `index.css`:

```css
/* Variables available */
--background
--foreground
--primary
--primary-foreground
--secondary
--muted
--muted-foreground
--accent
--border
--ring
```

### Tailwind Classes

```tsx
// ✅ Good - Use semantic colors
<div className="bg-background text-foreground border-border">

// ❌ Bad - Avoid hardcoded colors
<div className="bg-white text-black border-gray-200">
```

### Common Utility Classes

| Class | Purpose |
|-------|---------|
| `glass` | Frosted glass effect |
| `card-shadow` | Elevated shadow |
| `gradient-text` | Gradient text effect |
| `gradient-hero` | Hero section gradient |

### Responsive Design

```tsx
// Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run specific file
npm run test src/components/ToolCard.test.tsx
```

### Writing Tests

```tsx
import { render, screen } from "@testing-library/react";
import { ToolCard } from "./ToolCard";

describe("ToolCard", () => {
  it("renders tool name", () => {
    render(<ToolCard tool={mockTool} />);
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
  });
});
```

---

## ⚡ Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from "react";

const AdminPanel = lazy(() => import("./pages/Admin"));

<Suspense fallback={<Loading />}>
  <AdminPanel />
</Suspense>
```

### Image Optimization

- Use WebP format
- Lazy load images
- Provide width/height

### Query Optimization

```tsx
// Only fetch needed columns
const { data } = await supabase
  .from("ai_tools")
  .select("id, name, rating, category");

// Use pagination
const { data } = await supabase
  .from("ai_tools")
  .select("*")
  .range(0, 19); // First 20 items
```

---

## 🔧 Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

#### TypeScript errors with Supabase types
- Types are auto-generated - don't edit `types.ts`
- Restart dev server after schema changes

#### Auth not persisting
- Check localStorage is enabled
- Verify session token validity

#### RLS policy blocking requests
- Check user is authenticated
- Verify policy conditions in Supabase

### Debug Logging

```tsx
// Enable Supabase debug mode
const supabase = createClient(url, key, {
  auth: { debug: true }
});
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)

---

<div align="center">
  <strong>Happy coding! 💻</strong>
</div>
