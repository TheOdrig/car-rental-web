# ADR-009: Form Handling Strategy

**Status:** Accepted  
**Date:** 2026-02-01  
**Decider:** Mehmet Akif Uludag

---

## Context

We needed to choose a form handling solution that provides validation, error handling, type safety, and good developer experience while integrating well with our tech stack (React, TypeScript, Next.js).

**Key Considerations:**
- Form state management
- Validation (client-side and server-side)
- Error handling
- Type safety
- Performance
- Developer experience

---

## Decision

We will use **Zod** for schema validation and **react-hook-form** for form state management, with **server-side validation sync** to ensure consistency with backend.

**Key Decisions:**
1. Use Zod for schema definition and validation
2. Use react-hook-form for form state management
3. Sync Zod schemas with backend validation
4. Use @hookform/resolvers for Zod integration
5. Implement consistent error handling

---

## Rationale

### Why Zod Over Yup?

**TypeScript-First:**
- **Type Inference:** TypeScript types inferred from schema
- **Type Safety:** No manual type definitions needed
- **Better DX:** Autocomplete and IntelliSense

**Smaller Bundle:**
- **Zod:** ~8KB minified + gzipped
- **Yup:** ~15KB minified + gzipped

**Better API:**
- **Composable:** Easy to compose schemas
- **Transformations:** Built-in data transformations
- **Custom Validators:** Easy to add custom validation

**Example:**
```typescript
// src/features/auth/model/types.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
```

**Benefits:**
- **Type Inference:** `LoginRequest` type automatically inferred
- **Validation:** Schema validates input
- **Reusable:** Schema used for both client and server validation

### react-hook-form Integration

**Why react-hook-form?**
- **Performance:** Minimal re-renders (uncontrolled inputs)
- **Small Bundle:** ~9KB minified + gzipped
- **TypeScript Support:** Full TypeScript types
- **Easy Integration:** Works with Zod via @hookform/resolvers

**Example:**
```typescript
// src/features/auth/ui/login-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginRequest } from '../model/types';
import { useLogin } from '../lib/use-auth';

export function LoginForm() {
  const login = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    await login.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

**Benefits:**
- **Minimal Re-Renders:** Only re-renders on error or submit
- **Type Safety:** TypeScript knows form fields and types
- **Easy Validation:** Zod schema validates automatically
- **Error Handling:** Errors available in `formState.errors`

### Server-Side Validation Sync

**Shared Schema Pattern:**
```typescript
// Frontend: src/features/auth/model/types.ts
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Backend: src/main/java/com/carrental/auth/dto/LoginRequest.java
@Data
public class LoginRequest {
    @Email(message = "Invalid email address")
    private String email;
    
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
```

**Validation Sync:**
- Frontend validates with Zod
- Backend validates with Bean Validation
- **Same rules:** Email format, password length
- **Consistent errors:** Same error messages

**Benefits:**
- **Consistency:** Same validation rules on client and server
- **Security:** Server-side validation prevents bypassing client validation
- **UX:** Client-side validation provides instant feedback

### Error Handling

**Client-Side Errors (Zod):**
```typescript
const result = LoginSchema.safeParse(data);

if (!result.success) {
  // result.error.errors contains validation errors
  console.log(result.error.errors);
}
```

**Server-Side Errors (API):**
```typescript
try {
  await login.mutateAsync(data);
} catch (error) {
  if (error.response?.status === 400) {
    // Validation error from server
    setError('email', { message: error.response.data.message });
  }
}
```

**Consistent Error Display:**
```typescript
<input
  {...register('email')}
  aria-invalid={!!errors.email}
/>
{errors.email && (
  <span className="text-destructive text-sm">
    {errors.email.message}
  </span>
)}
```

---

## Consequences

### Positive

✅ **Type Safety**
- TypeScript types inferred from Zod schema
- No manual type definitions
- Autocomplete in IDE

✅ **Performance**
- react-hook-form minimizes re-renders
- Uncontrolled inputs (no state updates on every keystroke)
- Small bundle size (~17KB total)

✅ **Developer Experience**
- Simple API (register, handleSubmit, errors)
- Easy validation with Zod
- Good error messages

✅ **Validation Consistency**
- Same validation rules on client and server
- Zod schema can be shared (if using TypeScript on backend)
- Consistent error messages

✅ **Accessibility**
- Easy to add ARIA attributes
- Error messages linked to inputs
- Focus management

### Negative

❌ **Learning Curve**
- Must learn Zod schema syntax
- Must learn react-hook-form API
- Must understand resolver pattern

❌ **Validation Duplication**
- Must maintain validation rules in two places (frontend Zod, backend Bean Validation)
- Can get out of sync if not careful

❌ **Complex Forms**
- Nested objects and arrays can be tricky
- Dynamic fields require extra setup
- File uploads need special handling

### Mitigation

**Learning Curve:**
- Provide training and documentation
- Code examples in DEVELOPER_GUIDE.md
- Reusable form components

**Validation Duplication:**
- Document validation rules in one place
- Review validation rules in code review
- Consider generating Zod schemas from OpenAPI spec (future)

**Complex Forms:**
- Create reusable form components
- Document complex form patterns
- Use react-hook-form's useFieldArray for dynamic fields

---

## Alternatives Considered

### Alternative 1: Formik

**Pros:**
- Popular, mature library
- Good documentation
- Large community

**Cons:**
- Larger bundle size (~15KB)
- More re-renders (controlled inputs)
- Less TypeScript support

**Decision:** Rejected - react-hook-form has better performance and TypeScript support

### Alternative 2: Yup (instead of Zod)

**Pros:**
- More mature
- Larger community
- More examples

**Cons:**
- Larger bundle size (~15KB)
- Weaker TypeScript support
- No type inference

**Decision:** Rejected - Zod has better TypeScript support and smaller bundle

### Alternative 3: Native HTML5 Validation

**Pros:**
- No dependencies
- Built-in browser support
- Simple

**Cons:**
- Limited validation rules
- Inconsistent browser support
- No TypeScript integration
- Hard to customize error messages

**Decision:** Rejected - Too limited for complex forms

### Alternative 4: Manual State Management

**Pros:**
- Full control
- No dependencies
- Smallest bundle

**Cons:**
- Must implement validation manually
- Must implement error handling manually
- Must implement form state manually
- Reinventing the wheel

**Decision:** Rejected - Too much manual work

---

## Implementation Notes

### Form Component Pattern

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MySchema, type MyFormData } from '../model/types';

export function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MyFormData>({
    resolver: zodResolver(MySchema),
  });

  const onSubmit = async (data: MyFormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Schema Definition Pattern

```typescript
// src/features/my-feature/model/types.ts
import { z } from 'zod';

export const MySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
});

export type MyFormData = z.infer<typeof MySchema>;
```

### Error Display Pattern

```typescript
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    {...register('email')}
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <span id="email-error" className="text-destructive text-sm">
      {errors.email.message}
    </span>
  )}
</div>
```

### Server-Side Validation Pattern

```typescript
const onSubmit = async (data: MyFormData) => {
  try {
    await submitForm(data);
  } catch (error) {
    if (error.response?.status === 400) {
      // Server validation error
      const serverErrors = error.response.data.errors;
      
      // Set errors from server
      Object.keys(serverErrors).forEach((field) => {
        setError(field, { message: serverErrors[field] });
      });
    }
  }
};
```

---

## References

- [Zod Documentation](https://zod.dev/)
- [react-hook-form Documentation](https://react-hook-form.com/)
- [@hookform/resolvers Documentation](https://github.com/react-hook-form/resolvers)
- [Form Validation Best Practices](https://web.dev/sign-in-form-best-practices/)

---

**Related ADRs:**
- [ADR-005: Component Library](ADR-005-component-library.md)

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag
