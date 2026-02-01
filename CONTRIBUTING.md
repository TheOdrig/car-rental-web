# Contributing to Car Rental Web

Thank you for considering contributing to the Car Rental Web! This document provides guidelines and instructions for contributing to this project.

---

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Development Setup](#development-setup)
- [Development Guidelines](#development-guidelines)
  - [Code Style](#code-style)
  - [Project Structure](#project-structure)
  - [Testing Requirements](#testing-requirements)
- [Making Changes](#making-changes)
  - [Branch Naming](#branch-naming)
  - [Commit Messages](#commit-messages)
  - [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
  - [Bug Reports](#bug-reports)
  - [Feature Requests](#feature-requests)
- [Code Review](#code-review)
  - [Review Process](#review-process)
  - [Approval Requirements](#approval-requirements)
- [Additional Resources](#additional-resources)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - Required for Next.js 16
- **npm 10+** - Package management
- **Git** - Version control
- **Backend API** - Running [car-rental-api](https://github.com/TheOdrig/car-rental-api)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheOdrig/car-rental-web.git
   cd car-rental-web
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

---

## Development Guidelines

### Code Style

Follow the existing code patterns and conventions:

- **TypeScript**: Use strict typing (no `any`, no `@ts-ignore`)
- **React**: Use functional components with hooks
- **Naming**: Use descriptive names (camelCase for variables, PascalCase for components)

- **Reference**: See `DEVELOPER_GUIDE.md` for detailed FSD standards

### Project Structure

This project uses **Feature-Sliced Design (FSD)** with 5 layers:

```
src/
├── app/           # App + Pages layer (Next.js App Router)
├── widgets/       # Composite UI blocks
├── features/      # User actions and business logic
├── entities/      # Domain models
└── shared/        # Reusable infrastructure
```

For detailed architecture information, see `DEVELOPER_GUIDE.md`.

### Testing Requirements

- **All new features must have tests**
- **Maintain or improve code coverage (80%+)**

**Run the full test suite:**
```bash
npm test
```

**Run architecture verification:**
```bash
npm run test:architecture
```

> ⚠️ **Important**: Architecture tests must pass before any PR can be merged. These tests enforce FSD boundaries and prevent architectural violations.

---

## Making Changes

### Branch Naming

Use the following branch naming conventions:

| Prefix | Purpose | Example |
|--------|---------|--------|
| `feature/` | New features | `feature/oauth2-github` |
| `fix/` | Bug fixes | `fix/123-booking-validation` |
| `refactor/` | Code refactoring | `refactor/car-filters-hook` |
| `docs/` | Documentation updates | `docs/api-client-guide` |
| `test/` | Test additions | `test/booking-flow` |

### Commit Messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

**Examples:**
```
feat(auth): add OAuth2 Google login
fix(booking): resolve date picker timezone issue
docs(api): add authentication flow documentation
test(rental): add property-based tests for pricing
```

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the code style guidelines
3. **Write/update tests** for your changes
4. **Ensure all tests pass** locally
5. **Create a Pull Request** with a clear description

**PR Checklist:**

```markdown
- [ ] Code follows FSD architecture guidelines
- [ ] Tests added/updated for changes
- [ ] All tests pass (`npm test`)
- [ ] Architecture tests pass (`npm run test:architecture`)
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript check passes (`npm run type-check`)
- [ ] Documentation updated if needed
- [ ] No console.log statements
- [ ] PR description explains changes
```

---

## Reporting Issues

### Bug Reports

When reporting a bug, please include:

1. **Summary** - A clear and descriptive title
2. **Environment** - Node version, OS, browser
3. **Steps to Reproduce** - Detailed steps to reproduce the issue
4. **Expected Behavior** - What you expected to happen
5. **Actual Behavior** - What actually happened
6. **Screenshots** - If applicable

**Example:**
```
Title: Booking form validation fails on date selection

Environment: Node 20.10, macOS 14, Chrome 120
Steps: 1. Navigate to /cars/123  2. Select dates  3. Click "Book Now"
Expected: Form validates and proceeds
Actual: Validation error "Invalid date range"
Screenshots: [attached]
```

### Feature Requests

When requesting a feature, please include:

1. **Problem Statement** - What problem does this solve?
2. **Proposed Solution** - How would you like it to work?
3. **Alternatives Considered** - Other approaches you've thought about
4. **Additional Context** - Any other relevant information

> 💡 **Tip**: Check existing issues first to avoid duplicates.

---

## Code Review

### Review Process

1. **Automated Checks** - CI runs tests and architecture verification
2. **Code Review** - I will review your code
3. **Feedback** - I'll provide feedback or request changes if needed
4. **Approval** - I approve if all criteria are met
5. **Merge** - I merge the PR into `main`

### Approval Requirements

- All CI checks must pass
- My approval on the PR
- No unresolved conversations
- Branch is up-to-date with `main`

> ⏱️ **Response Time**: I aim to review PRs within 48-72 hours.

---

## Additional Resources

- **[README.md](README.md)** - Project overview and quick start
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - In-depth FSD architecture guide
- **[docs/architecture/](docs/architecture/)** - Architecture documentation and diagrams
- **[docs/api/](docs/api/)** - API client documentation
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

---

## Questions?

If you have questions that aren't covered in this guide, feel free to open an issue with the `question` label.

**Thank you for contributing! 🚗💨**

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag
