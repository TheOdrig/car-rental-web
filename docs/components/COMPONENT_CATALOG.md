# Component Catalog

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

This catalog documents all shared UI components in the Car Rental Web application. These are reusable primitives built on shadcn/ui and Radix UI.

---

## Table of Contents

1. [Button](#button)
2. [Card](#card)
3. [Input](#input)
4. [Badge](#badge)
5. [Alert & Alert Dialog](#alert--alert-dialog)
6. [Avatar](#avatar)
7. [Calendar](#calendar)
8. [Checkbox](#checkbox)
9. [Dialog](#dialog)
10. [Dropdown Menu](#dropdown-menu)
11. [Form Field](#form-field)
12. [Label](#label)
13. [Select](#select)
14. [Table](#table)
15. [Textarea](#textarea)
16. [Other Components](#other-components)

---

## Button

**Location:** `src/shared/ui/button.tsx`

**Purpose:** Primary action component with multiple variants and sizes.

### Props

```typescript
interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  asChild?: boolean;
}
```

### Variants

- **default** - Primary button (blue background)
- **destructive** - Danger button (red background)
- **outline** - Outlined button (transparent with border)
- **secondary** - Secondary button (gray background)
- **ghost** - Ghost button (transparent, hover effect)
- **link** - Link-styled button (underline on hover)

### Sizes

- **default** - h-9, px-4
- **xs** - h-6, px-2 (extra small)
- **sm** - h-8, px-3 (small)
- **lg** - h-10, px-6 (large)
- **icon** - size-9 (square icon button)
- **icon-xs** - size-6 (extra small icon)
- **icon-sm** - size-8 (small icon)
- **icon-lg** - size-10 (large icon)

### Usage

```typescript
import { Button } from '@/shared/ui/button';

// Primary button
<Button>Click me</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Outline button with icon
<Button variant="outline" size="sm">
  <Icon />
  Save
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Icon />
</Button>

// As child (renders as link)
<Button asChild>
  <Link href="/login">Login</Link>
</Button>
```

---

## Card

**Location:** `src/shared/ui/card.tsx`

**Purpose:** Container component for grouping related content.

### Components

- `Card` - Main card container
- `CardHeader` - Card header section
- `CardTitle` - Card title
- `CardDescription` - Card description
- `CardAction` - Card action button (top-right)
- `CardContent` - Card content section
- `CardFooter` - Card footer section

### Props

All components extend `React.ComponentProps<"div">` (className, children, etc.)

### Usage

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '@/shared/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
    <CardAction>
      <Button size="sm">Action</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Footer Action</Button>
  </CardFooter>
</Card>
```

---

## Input

**Location:** `src/shared/ui/input.tsx`

**Purpose:** Text input component with validation states.

### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationState?: "default" | "valid" | "invalid" | "empty" | "loading" | "disabled";
  error?: string;
  success?: string;
  isLoading?: boolean;
}
```

### Validation States

- **default** - Normal state
- **valid** - Valid input (green border)
- **invalid** - Invalid input (red border)
- **empty** - Empty required field (yellow border)
- **loading** - Loading state (blue border)
- **disabled** - Disabled state (gray background)

### Usage

```typescript
import { Input } from '@/shared/ui/input';

// Basic input
<Input type="email" placeholder="Email" />

// With validation
<Input
  type="email"
  value={email}
  error={errors.email}
  placeholder="Email"
/>

// With success state
<Input
  type="email"
  value={email}
  success="Email is valid"
  placeholder="Email"
/>

// Loading state
<Input
  type="text"
  isLoading={true}
  placeholder="Searching..."
/>
```

---

## Badge

**Location:** `src/shared/ui/badge.tsx`

**Purpose:** Small label component for status, tags, or categories.

### Props

```typescript
interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: "default" | "secondary" | "destructive" | "outline";
  asChild?: boolean;
}
```

### Variants

- **default** - Primary badge (blue background)
- **secondary** - Secondary badge (gray background)
- **destructive** - Danger badge (red background)
- **outline** - Outlined badge (transparent with border)

### Usage

```typescript
import { Badge } from '@/shared/ui/badge';

// Status badge
<Badge>Active</Badge>

// Destructive badge
<Badge variant="destructive">Cancelled</Badge>

// Outline badge
<Badge variant="outline">Pending</Badge>

// As link
<Badge asChild>
  <Link href="/tag/featured">Featured</Link>
</Badge>
```

---

## Alert & Alert Dialog

**Location:** `src/shared/ui/alert.tsx`, `src/shared/ui/alert-dialog.tsx`

### Alert

**Purpose:** Display important messages or notifications.

**Components:**
- `Alert` - Alert container
- `AlertTitle` - Alert title
- `AlertDescription` - Alert description

**Variants:** `default`, `destructive`

**Usage:**
```typescript
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/alert';

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>
```

### Alert Dialog

**Purpose:** Modal dialog for confirmations and important actions.

**Components:**
- `AlertDialog` - Dialog container
- `AlertDialogTrigger` - Trigger button
- `AlertDialogContent` - Dialog content
- `AlertDialogHeader` - Dialog header
- `AlertDialogTitle` - Dialog title
- `AlertDialogDescription` - Dialog description
- `AlertDialogFooter` - Dialog footer
- `AlertDialogAction` - Confirm button
- `AlertDialogCancel` - Cancel button

**Usage:**
```typescript
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/shared/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Avatar

**Location:** `src/shared/ui/avatar.tsx`

**Purpose:** Display user profile pictures with fallback.

**Components:**
- `Avatar` - Avatar container
- `AvatarImage` - Avatar image
- `AvatarFallback` - Fallback content (initials)

**Usage:**
```typescript
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';

<Avatar>
  <AvatarImage src="/avatars/user.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

## Calendar

**Location:** `src/shared/ui/calendar.tsx`

**Purpose:** Date picker calendar component.

**Props:**
```typescript
interface CalendarProps {
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[] | DateRange;
  onSelect?: (date: Date | Date[] | DateRange) => void;
  disabled?: (date: Date) => boolean;
  // ... more props from react-day-picker
}
```

**Usage:**
```typescript
import { Calendar } from '@/shared/ui/calendar';

const [date, setDate] = useState<Date>();

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={(date) => date < new Date()}
/>
```

---

## Checkbox

**Location:** `src/shared/ui/checkbox.tsx`

**Purpose:** Checkbox input component.

**Props:**
```typescript
interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  // Extends Radix UI Checkbox props
}
```

**Usage:**
```typescript
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```

---

## Dialog

**Location:** `src/shared/ui/dialog.tsx`

**Purpose:** Modal dialog component.

**Components:**
- `Dialog` - Dialog container
- `DialogTrigger` - Trigger button
- `DialogContent` - Dialog content
- `DialogHeader` - Dialog header
- `DialogTitle` - Dialog title
- `DialogDescription` - Dialog description
- `DialogFooter` - Dialog footer
- `DialogClose` - Close button

**Usage:**
```typescript
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description text
      </DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Dropdown Menu

**Location:** `src/shared/ui/dropdown-menu.tsx`

**Purpose:** Dropdown menu component.

**Components:**
- `DropdownMenu` - Menu container
- `DropdownMenuTrigger` - Trigger button
- `DropdownMenuContent` - Menu content
- `DropdownMenuItem` - Menu item
- `DropdownMenuLabel` - Menu label
- `DropdownMenuSeparator` - Menu separator
- `DropdownMenuCheckboxItem` - Checkbox item
- `DropdownMenuRadioGroup` - Radio group
- `DropdownMenuRadioItem` - Radio item
- `DropdownMenuSub` - Submenu

**Usage:**
```typescript
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Form Field

**Location:** `src/shared/ui/form-field.tsx`

**Purpose:** Form field wrapper with label, input, and error message.

**Usage:**
```typescript
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

<FormField
  label="Email"
  error={errors.email}
  required
>
  <Input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>
```

---

## Label

**Location:** `src/shared/ui/label.tsx`

**Purpose:** Form label component.

**Usage:**
```typescript
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

---

## Select

**Location:** `src/shared/ui/select.tsx`

**Purpose:** Select dropdown component.

**Components:**
- `Select` - Select container
- `SelectTrigger` - Trigger button
- `SelectContent` - Dropdown content
- `SelectItem` - Select option
- `SelectValue` - Selected value display
- `SelectGroup` - Option group
- `SelectLabel` - Group label

**Usage:**
```typescript
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/shared/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

---

## Table

**Location:** `src/shared/ui/table.tsx`

**Purpose:** Table component for displaying tabular data.

**Components:**
- `Table` - Table container
- `TableHeader` - Table header
- `TableBody` - Table body
- `TableFooter` - Table footer
- `TableRow` - Table row
- `TableHead` - Table header cell
- `TableCell` - Table data cell
- `TableCaption` - Table caption

**Usage:**
```typescript
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Textarea

**Location:** `src/shared/ui/textarea.tsx`

**Purpose:** Multi-line text input component.

**Props:**
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Standard textarea props
}
```

**Usage:**
```typescript
import { Textarea } from '@/shared/ui/textarea';

<Textarea
  placeholder="Enter your message"
  rows={4}
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>
```

---

## Other Components

### Breadcrumb

**Location:** `src/shared/ui/breadcrumb.tsx`

**Purpose:** Breadcrumb navigation component.

### Chart

**Location:** `src/shared/ui/chart.tsx`

**Purpose:** Chart components (built on Recharts).

### Coming Soon Banner

**Location:** `src/shared/ui/coming-soon-banner.tsx`

**Purpose:** Banner for features under development.

### Copy Button

**Location:** `src/shared/ui/copy-button.tsx`

**Purpose:** Button to copy text to clipboard.

### Dynamic Image

**Location:** `src/shared/ui/dynamic-image.tsx`

**Purpose:** Image component with loading and error states.

### Empty State

**Location:** `src/shared/ui/empty-state.tsx`

**Purpose:** Empty state placeholder component.

### Error Boundary

**Location:** `src/shared/ui/error-boundary.tsx`

**Purpose:** React error boundary component.

### Error Message

**Location:** `src/shared/ui/error-message.tsx`

**Purpose:** Error message display component.

### Pagination

**Location:** `src/shared/ui/pagination.tsx`

**Purpose:** Pagination component for lists.

### Popover

**Location:** `src/shared/ui/popover.tsx`

**Purpose:** Popover component for tooltips and popovers.

### Sheet

**Location:** `src/shared/ui/sheet.tsx`

**Purpose:** Slide-out panel component (drawer).

### Skeleton

**Location:** `src/shared/ui/skeleton.tsx`

**Purpose:** Loading skeleton component.

**Usage:**
```typescript
import { Skeleton } from '@/shared/ui/skeleton';

<Skeleton className="h-12 w-full" />
```

### Slider

**Location:** `src/shared/ui/slider.tsx`

**Purpose:** Range slider component.

### Sonner

**Location:** `src/shared/ui/sonner.tsx`

**Purpose:** Toast notification component.

**Usage:**
```typescript
import { toast } from 'sonner';

toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
```

### Stat Card

**Location:** `src/shared/ui/stat-card.tsx`

**Purpose:** Statistics card component.

### Switch

**Location:** `src/shared/ui/switch.tsx`

**Purpose:** Toggle switch component.

**Usage:**
```typescript
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';

<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>
```

### Tooltip

**Location:** `src/shared/ui/tooltip.tsx`

**Purpose:** Tooltip component.

**Usage:**
```typescript
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/shared/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Validation Icon

**Location:** `src/shared/ui/validation-icon.tsx`

**Purpose:** Validation state icon component.

---

## Component Library Stack

### shadcn/ui

**Why shadcn/ui?**
- Copy-paste components (full control)
- Built on Radix UI (accessibility)
- Tailwind CSS styling
- TypeScript-first
- No package dependency (components are yours)

### Radix UI

**Foundation:** All components built on Radix UI primitives
- Unstyled, accessible components
- WAI-ARIA compliant
- Keyboard navigation
- Focus management

### CVA (class-variance-authority)

**Styling:** Component variants managed with CVA
- Type-safe variants
- Composable styles
- Tailwind CSS integration

---

## Usage Guidelines

### Import Pattern

```typescript
// ✅ CORRECT: Import from shared/ui
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle } from '@/shared/ui/card';

// ❌ WRONG: Deep import
import { Button } from '@/shared/ui/button/button';
```

### Customization

Components can be customized via className:

```typescript
<Button className="w-full">Full Width Button</Button>
<Card className="max-w-md">Narrow Card</Card>
```

### Composition

Components are designed to be composed:

```typescript
<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
    <CardAction>
      <Button size="sm">Edit</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <Avatar>
      <AvatarImage src="/avatar.jpg" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
    <div>
      <Label>Email</Label>
      <Input type="email" value={email} />
    </div>
  </CardContent>
</Card>
```

---

## Accessibility

All components follow accessibility best practices:

- **Keyboard Navigation:** All interactive components support keyboard navigation
- **ARIA Attributes:** Proper ARIA labels and roles
- **Focus Management:** Visible focus indicators
- **Screen Reader Support:** Semantic HTML and ARIA labels

---

## Dark Mode

All components support dark mode via Tailwind's `dark:` variant:

```typescript
// Automatic dark mode support
<Card>
  <CardTitle>This card adapts to dark mode</CardTitle>
</Card>
```

---

**For detailed FSD guide, see [FSD_GUIDE.md](../architecture/FSD_GUIDE.md)**  
**For component library decision, see [ADR-005](../adr/ADR-005-component-library.md)**  
**For styling strategy, see [ADR-006](../adr/ADR-006-styling-strategy.md)**

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag
