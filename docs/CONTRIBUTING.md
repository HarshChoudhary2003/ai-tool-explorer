# Contributing to AI Tools Explorer

<div align="center">
  <h3>🤝 Contribution Guidelines</h3>
  <p>Thank you for your interest in contributing!</p>
</div>

---

## 📖 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Pull Request Process](#pull-request-process)
6. [Issue Guidelines](#issue-guidelines)
7. [Testing Requirements](#testing-requirements)

---

## 📜 Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

---

## 🚀 How to Contribute

### Types of Contributions

| Type | Description |
|------|-------------|
| 🐛 **Bug Fixes** | Fix reported issues |
| ✨ **Features** | Implement new functionality |
| 📚 **Documentation** | Improve docs and comments |
| 🎨 **UI/UX** | Design improvements |
| ⚡ **Performance** | Optimization improvements |
| 🧪 **Tests** | Add or improve tests |

### Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-tools-explorer.git
   ```
3. **Set up development environment**
   ```bash
   cd ai-tools-explorer
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 💻 Development Workflow

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/add-dark-mode` |
| Bug Fix | `fix/description` | `fix/login-redirect` |
| Docs | `docs/description` | `docs/api-reference` |
| Refactor | `refactor/description` | `refactor/tool-card` |

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]
[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(tools): add infinite scroll to category page
fix(auth): resolve session persistence issue
docs(readme): update installation instructions
```

---

## 📏 Coding Standards

### TypeScript

```typescript
// ✅ Good
interface ToolProps {
  tool: Tool;
  onBookmark?: (id: string) => void;
}

export function ToolCard({ tool, onBookmark }: ToolProps) {
  // Implementation
}

// ❌ Bad
export function ToolCard(props: any) {
  // No type safety
}
```

### React Components

```tsx
// ✅ Good - Functional component with hooks
export function ToolCard({ tool }: ToolProps) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="glass p-4 rounded-xl">
      {/* Content */}
    </div>
  );
}

// ❌ Bad - Missing accessibility, inline styles
export function ToolCard({ tool }) {
  return (
    <div style={{ padding: 16 }}>
      <img src={tool.logo} />
    </div>
  );
}
```

### Styling

```tsx
// ✅ Good - Semantic tokens
<div className="bg-background text-foreground border-border">

// ❌ Bad - Hardcoded colors
<div className="bg-white text-black border-gray-200">
```

### File Organization

```
src/components/
├── ui/                 # Base UI components
├── ToolCard.tsx        # Single component
├── ToolCard.test.tsx   # Component tests
└── index.ts            # Barrel exports
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add/update tests** for changes
3. **Run linting**
   ```bash
   npm run lint
   ```
4. **Test locally**
   ```bash
   npm run dev
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Verified no regressions

## Screenshots (if UI changes)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Updated documentation
- [ ] No new warnings
```

### Review Process

1. Submit PR against `main` branch
2. Automated checks run (lint, build)
3. Code review by maintainers
4. Address feedback
5. Merge after approval

---

## 🐛 Issue Guidelines

### Bug Reports

Include:

- **Environment** (browser, OS)
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots/errors**

### Feature Requests

Include:

- **Use case description**
- **Proposed solution**
- **Alternatives considered**
- **Additional context**

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `documentation` | Documentation improvement |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `priority: high` | Urgent issue |

---

## 🧪 Testing Requirements

### Unit Tests

```typescript
import { render, screen } from "@testing-library/react";
import { ToolCard } from "./ToolCard";

describe("ToolCard", () => {
  const mockTool = {
    id: "1",
    name: "Test Tool",
    description: "Description",
    category: "llm",
    pricing: "free",
  };

  it("renders tool name", () => {
    render(<ToolCard tool={mockTool} />);
    expect(screen.getByText("Test Tool")).toBeInTheDocument();
  });

  it("shows pricing badge", () => {
    render(<ToolCard tool={mockTool} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });
});
```

### Integration Tests

Test database interactions and API calls:

```typescript
describe("Tool API", () => {
  it("fetches tools by category", async () => {
    const { data } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("category", "llm");
    
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
  });
});
```

### Running Tests

```bash
# All tests
npm run test

# Specific file
npm run test ToolCard

# With coverage
npm run test --coverage
```

---

## 📬 Questions?

- Open an issue for questions
- Check existing issues first
- Be patient and respectful

---

<div align="center">
  <strong>Thank you for contributing! 🎉</strong>
</div>
