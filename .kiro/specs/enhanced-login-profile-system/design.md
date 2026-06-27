# Design Document: Enhanced Login & Profile System

## Overview

This design document outlines the architecture and implementation strategy for transforming the DevTrack AI authentication and profile management system from basic HTML form submission to a modern, professional React-based interface with comprehensive client-side validation, real-time feedback, smooth animations, and full API integration.

### Current State

- Login and register pages use server-side form submission (`<form action="/api/auth/..." method="post">`)
- No client-side validation or error handling
- No loading states during API requests
- Profile page displays hardcoded placeholder data
- No real-time feedback or user experience enhancements
- Missing accessibility features and mobile optimizations

### Target State

- Client-side React components with controlled inputs and state management
- Real-time validation with immediate user feedback
- Password strength indicator with visual feedback
- Loading states with animated spinners and skeleton loaders
- Toast notifications for success/error messages
- Full API integration for profile data fetching and updating
- Route protection middleware ensuring authenticated access
- Smooth animations and transitions throughout the UI
- Full accessibility compliance (WCAG 2.1 AA)
- Mobile-responsive design (320px and above)

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Validation**: Zod (already in use)
- **State Management**: React Hooks (useState, useEffect)
- **Styling**: Tailwind CSS 4
- **Animations**: CSS transitions and Framer Motion (already installed)
- **Icons**: Lucide React (already installed)
- **HTTP Client**: Native Fetch API
- **Type Safety**: TypeScript 5


## Architecture

### Component Hierarchy

```
App
├── (auth) Layout
│   ├── LoginPage (Client Component)
│   │   ├── LoginForm
│   │   │   ├── FormInput (with validation)
│   │   │   ├── PasswordInput (with show/hide toggle)
│   │   │   ├── RememberMeCheckbox
│   │   │   ├── ForgotPasswordLink
│   │   │   └── SubmitButton (with loading state)
│   │   └── ErrorDisplay
│   │
│   └── RegisterPage (Client Component)
│       ├── RegisterForm
│       │   ├── FormInput (with validation)
│       │   ├── PasswordInput (with strength indicator)
│       │   ├── PasswordStrengthIndicator
│       │   └── SubmitButton (with loading state)
│       └── ErrorDisplay
│
├── (app) Layout (Protected)
│   └── ProfilePage (Client Component)
│       ├── ProfileForm
│       │   ├── FormInput (with validation)
│       │   ├── LoadingSkeleton
│       │   └── SaveButton (with loading state)
│       └── ToastNotification
│
└── Middleware (Route Protection)
```

### Data Flow

#### Authentication Flow
1. User enters credentials → Form state updated (controlled components)
2. User submits form → Client-side validation runs
3. If validation fails → Display inline error messages
4. If validation passes → API request sent with loading state
5. API responds → Handle success (redirect) or error (display message)

#### Profile Flow
1. Page loads → Fetch profile data from `/api/profile` GET
2. Display loading skeleton during fetch
3. On success → Populate form fields with fetched data
4. User modifies fields → Update form state and track changes
5. User clicks save → Validate and send PATCH request
6. Display toast notification on success/error


## Components and Interfaces

### 1. LoginForm Component

**Purpose**: Client-side login form with validation and loading states

**State Management**:
```typescript
interface LoginFormState {
  mobileNumber: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
  errors: {
    mobileNumber?: string;
    password?: string;
    form?: string; // API errors
  };
  isLoading: boolean;
}
```

**Key Functions**:
- `handleInputChange(field: string, value: string)`: Update form state
- `validateField(field: string)`: Validate individual field
- `validateForm()`: Validate entire form before submission
- `handleSubmit(e: FormEvent)`: Submit form to API
- `handleApiError(error: unknown)`: Parse and display API errors

**Validation Rules**:
- Mobile Number: 8-16 characters, numeric with optional + and spaces
- Password: Minimum 8 characters
- Real-time validation on blur, comprehensive validation on submit

### 2. RegisterForm Component

**Purpose**: Client-side registration form with password strength indicator

**State Management**:
```typescript
interface RegisterFormState {
  name: string;
  mobileNumber: string;
  password: string;
  showPassword: boolean;
  passwordStrength: {
    score: number; // 0-5
    label: string; // "Too Short" | "Weak" | "Fair" | "Good" | "Strong"
    color: string; // CSS color for indicator
    suggestions: string[]; // Hints like "Add numbers"
  };
  errors: {
    name?: string;
    mobileNumber?: string;
    password?: string;
    form?: string;
  };
  isLoading: boolean;
}
```

**Key Functions**:
- `calculatePasswordStrength(password: string)`: Calculate strength metrics
- `validateMobileNumber(mobile: string)`: Validate phone format with regex
- `handleSubmit(e: FormEvent)`: Submit registration to API


### 3. ProfileForm Component

**Purpose**: Fetch and update user profile data with API integration

**State Management**:
```typescript
interface ProfileFormState {
  // Form data
  name: string;
  mobileNumber: string;
  profession: string;
  dailyTargetStudyHours: number;
  dailyTargetCodingHours: number;
  dailyTargetGymTime: number;
  
  // UI state
  errors: Record<string, string>;
  isLoading: boolean;
  isFetching: boolean;
  isSaving: boolean;
  isDirty: boolean; // Track if form has unsaved changes
  
  // Toast notification
  toast: {
    show: boolean;
    message: string;
    type: 'success' | 'error';
  } | null;
}
```

**Key Functions**:
- `fetchProfile()`: GET request to `/api/profile`
- `handleSave()`: PATCH request to `/api/profile`
- `validateProfileField(field: string, value: any)`: Validate individual fields
- `showToast(message: string, type: 'success' | 'error')`: Display notification
- `markAsDirty()`: Set isDirty flag when user modifies fields

**Validation Rules**:
- Name: Minimum 2 characters
- Mobile Number: 8-16 characters (same as login)
- Profession: Optional, no specific constraints
- Study/Coding Hours: 0-24 (warning if > 24)
- Gym Time: 0-1440 minutes (warning if > 1440)

### 4. PasswordStrengthIndicator Component

**Purpose**: Visual feedback for password strength

**Interface**:
```typescript
interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface StrengthMetrics {
  score: 0 | 1 | 2 | 3 | 4 | 5;
  label: string;
  color: string;
  percentage: number; // 0-100 for progress bar
  suggestions: string[];
}
```

**Strength Calculation Algorithm**:
```typescript
function calculateStrength(password: string): StrengthMetrics {
  let score = 0;
  const suggestions: string[] = [];
  
  if (password.length < 8) {
    return {
      score: 0,
      label: "Too Short",
      color: "#dc2626", // red-600
      percentage: 0,
      suggestions: ["Use at least 8 characters"]
    };
  }
  
  score++; // Base score for minimum length
  
  if (/[a-z]/.test(password)) score++;
  else suggestions.push("Add lowercase letters");
  
  if (/[A-Z]/.test(password)) score++;
  else suggestions.push("Add uppercase letters");
  
  if (/[0-9]/.test(password)) score++;
  else suggestions.push("Add numbers");
  
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push("Add special characters");
  
  const labels = ["Too Short", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#dc2626", "#ea580c", "#eab308", "#84cc16", "#22c55e"];
  
  return {
    score,
    label: labels[score],
    color: colors[score],
    percentage: (score / 5) * 100,
    suggestions
  };
}
```


### 5. Toast Notification Component

**Purpose**: Display success and error messages

**Interface**:
```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // Auto-dismiss after ms (default 3000)
  onClose: () => void;
}
```

**Features**:
- Auto-dismiss after configurable duration (default 3 seconds)
- Manual dismiss via close button
- Slide-in animation from top (300ms)
- Icon based on type (CheckCircle, XCircle, AlertTriangle, Info)
- Positioned fixed at top-right on desktop, top-center on mobile

### 6. LoadingSkeleton Component

**Purpose**: Display loading placeholder for profile form

**Structure**:
```typescript
interface SkeletonProps {
  className?: string;
}

// Skeleton displays animated pulse effect for:
// - 2 input fields (first row)
// - 1 full-width input (second row)
// - 3 input fields (third row)
// - 1 button (fourth row)
```

**Animation**: Pulse effect using Tailwind's `animate-pulse` class

### 7. FormInput Component (Reusable)

**Purpose**: Reusable input field with error display and validation

**Interface**:
```typescript
interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}
```

**Features**:
- Label with required indicator (*)
- Error message display below input
- Focus ring animation (150ms transition)
- Error state styling (red border)
- Accessible with proper ARIA attributes


## Data Models

### API Request/Response Types

#### Login Request
```typescript
interface LoginRequest {
  mobileNumber: string;
  password: string;
  rememberMe?: boolean;
}
```

#### Login Response (Success)
```typescript
// Server sets HTTP-only cookie and redirects to /dashboard
// No JSON response body on success
// Response: 303 redirect
```

#### Login Response (Error)
```typescript
interface LoginErrorResponse {
  error: string; // e.g., "Invalid mobile number or password."
}
// Status: 401 (Unauthorized) or 400 (Bad Request)
```

#### Register Request
```typescript
interface RegisterRequest {
  name: string;
  mobileNumber: string;
  password: string;
}
```

#### Register Response (Success)
```typescript
// Server sets HTTP-only cookie and redirects to /dashboard
// Response: 303 redirect
```

#### Register Response (Error)
```typescript
interface RegisterErrorResponse {
  error: string; // e.g., "Mobile number already registered"
}
// Status: 409 (Conflict) or 400 (Bad Request)
```

#### Profile GET Response
```typescript
interface ProfileResponse {
  _id: string;
  name: string;
  mobileNumber: string;
  profession?: string;
  dailyTargetStudyHours?: number;
  dailyTargetCodingHours?: number;
  dailyTargetGymTime?: number;
  createdAt: string;
  updatedAt: string;
}
```

#### Profile PATCH Request
```typescript
interface ProfileUpdateRequest {
  name?: string;
  profession?: string;
  dailyTargetStudyHours?: number;
  dailyTargetCodingHours?: number;
  dailyTargetGymTime?: number;
}
// Send only modified fields
```

#### Profile PATCH Response
```typescript
interface ProfileUpdateResponse {
  ok: boolean;
}
```


### Validation Schemas (Zod)

#### Mobile Number Validation
```typescript
const mobileNumberSchema = z
  .string()
  .min(8, "Mobile number must be at least 8 digits")
  .max(16, "Mobile number must not exceed 16 characters")
  .regex(/^[+]?[0-9\s]+$/, "Mobile number can only contain numbers, +, and spaces");
```

#### Password Validation
```typescript
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");
```

#### Name Validation
```typescript
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters");
```

#### Profile Numeric Fields
```typescript
const hourSchema = z
  .number()
  .min(0, "Value cannot be negative")
  .max(24, "Value cannot exceed 24 hours");

const gymTimeSchema = z
  .number()
  .min(0, "Value cannot be negative")
  .max(1440, "Value cannot exceed 1440 minutes (24 hours)");
```

### Client-Side Validation Functions

```typescript
// Real-time mobile number validation
function validateMobileNumber(mobile: string): string | undefined {
  if (!mobile) return "Mobile number is required";
  if (mobile.length < 8) return "Mobile number must be at least 8 digits";
  if (mobile.length > 16) return "Mobile number must not exceed 16 characters";
  if (!/^[+]?[0-9\s]+$/.test(mobile)) {
    return "Mobile number can only contain numbers, +, and spaces";
  }
  return undefined;
}

// Password validation for login
function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return undefined;
}

// Name validation for registration and profile
function validateName(name: string): string | undefined {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  return undefined;
}
```


## API Integration

### API Client Functions

#### Authentication API
```typescript
// POST /api/auth/login
async function loginUser(data: LoginRequest): Promise<void> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for cookies
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  
  // On success, server redirects (303), but we handle it client-side
  window.location.href = '/dashboard';
}

// POST /api/auth/register
async function registerUser(data: RegisterRequest): Promise<void> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  
  window.location.href = '/dashboard';
}
```

#### Profile API
```typescript
// GET /api/profile
async function fetchProfile(): Promise<ProfileResponse> {
  const response = await fetch('/api/profile', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    throw new Error('Failed to fetch profile');
  }
  
  return response.json();
}

// PATCH /api/profile
async function updateProfile(data: ProfileUpdateRequest): Promise<void> {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }
}
```

### Error Handling Strategy

**Error Categories**:
1. **Validation Errors**: Caught before API call, displayed inline
2. **Network Errors**: Fetch failures, timeouts - display with retry button
3. **API Errors**: 4xx/5xx responses - parse and display user-friendly messages
4. **Unauthorized Errors**: 401 responses - redirect to login

**Error Message Mapping**:
```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
}

function handleApiError(response: Response, defaultMessage: string): string {
  switch (response.status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Invalid mobile number or password.';
    case 409:
      return 'Mobile number already registered.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return defaultMessage;
  }
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Mobile Number Validation Correctness

*For any* string input to the mobile number validation function, the function SHALL return an error if and only if the string: (1) has fewer than 8 characters, OR (2) has more than 16 characters, OR (3) contains characters other than digits, '+', and spaces.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 2: Password Strength Calculation Determinism

*For any* password string with length >= 8, the password strength calculation SHALL return the same strength score, label, color, and suggestions when called multiple times with the same input.

**Validates: Requirements 3.3, 3.4, 3.5, 3.6, 3.8**

### Property 3: Password Strength Monotonicity

*For any* password string, adding character diversity (uppercase, numbers, or special characters) SHALL NOT decrease the strength score, and the score SHALL increase when transitioning from fewer to more character type categories.

**Validates: Requirements 3.3, 3.4, 3.5, 3.6**

### Property 4: Validation Error Prevention

*For any* form data that fails client-side validation, form submission SHALL be prevented and at least one error message SHALL be displayed to the user.

**Validates: Requirements 1.5, 9.8**


### Property 5: Error Message Display Completeness

*For any* form state containing multiple validation errors across different fields, ALL error messages SHALL be displayed simultaneously, with each error associated with its corresponding field.

**Validates: Requirements 12.6**

### Property 6: Profile Validation Boundary Enforcement

*For any* profile form data, the validation engine SHALL reject negative values for dailyTargetStudyHours, dailyTargetCodingHours, and dailyTargetGymTime, and SHALL display warnings (but not prevent submission) when values exceed reasonable maximums (24 hours for study/coding, 1440 minutes for gym).

**Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6, 9.7**

### Property 7: Name Validation Minimum Length

*For any* name string with fewer than 2 characters (including empty strings), the validation engine SHALL return an error and prevent form submission.

**Validates: Requirements 9.1**

### Property 8: Error Handling Message Mapping

*For any* API error response with a status code in the set {400, 401, 409, 500}, the error handler SHALL map the status code to a specific, user-friendly error message as defined in the error message mapping specification.

**Validates: Requirements 12.1, 12.2, 12.3, 12.5**



## Error Handling

### Error Categories

The authentication and profile system implements a comprehensive error handling strategy that categorizes errors into distinct types, each with specific handling procedures:

#### 1. Client-Side Validation Errors

**Trigger**: User input that violates validation rules before API submission

**Handling**:
- Display inline error messages immediately below the invalid field
- Use red color (#dc2626) and error icon for visual prominence
- Keep submit button enabled to allow user to see all validation errors
- Clear error message immediately when user corrects the input
- Support multiple simultaneous errors across different fields

**Examples**:
- "Mobile number must be at least 8 digits"
- "Password must be at least 8 characters"
- "Name must be at least 2 characters"

#### 2. Network Errors

**Trigger**: Fetch API failures, connection timeouts, or network unavailability

**Handling**:
- Display user-friendly message: "Network error. Please check your connection."
- Provide a "Retry" button to resend the failed request
- Maintain form data so user doesn't lose their input
- Log detailed error to console for debugging

**Recovery Strategy**:
- User clicks "Retry" → Resend identical request with same payload
- Implement exponential backoff for automatic retries (optional enhancement)



#### 3. API Client Errors (4xx)

**400 Bad Request**:
- Message: Display specific error from API response if available, otherwise "Invalid request. Please check your input."
- Action: Allow user to correct input and resubmit

**401 Unauthorized** (Login failure):
- Message: "Invalid mobile number or password."
- Action: Clear password field, keep mobile number, allow retry
- No redirect (user stays on login page)

**401 Unauthorized** (Session expired on profile/protected pages):
- Message: "Your session has expired. Please login again."
- Action: Redirect to /login page
- Store attempted URL for redirect after successful login

**409 Conflict** (Registration with existing mobile number):
- Message: "Mobile number already registered. Please login or use a different number."
- Action: Provide link to login page, allow user to change mobile number

#### 4. API Server Errors (5xx)

**500 Internal Server Error**:
- Message: "Server error. Please try again later."
- Action: Provide "Retry" button
- Log error details for monitoring

**503 Service Unavailable**:
- Message: "Service temporarily unavailable. Please try again in a few moments."
- Action: Provide "Retry" button with countdown timer

#### 5. Timeout Errors

**Trigger**: API request exceeds 30-second timeout

**Handling**:
- Message: "Request timed out. Please check your connection and try again."
- Action: Provide "Retry" button
- Cancel ongoing request before retry



### Error Display Mechanisms

#### Inline Field Errors
```typescript
<div className="space-y-1">
  <input 
    className={error ? "border-red-500" : "border-gray-300"}
    aria-invalid={!!error}
    aria-describedby={error ? `${name}-error` : undefined}
  />
  {error && (
    <p 
      id={`${name}-error`}
      className="text-sm text-red-600 flex items-center gap-1"
      role="alert"
    >
      <XCircle className="w-4 h-4" />
      {error}
    </p>
  )}
</div>
```

#### Toast Notifications
```typescript
interface ToastNotification {
  message: string;
  type: 'success' | 'error' | 'warning';
  duration: number; // milliseconds
  showRetry?: boolean;
  onRetry?: () => void;
}
```

Toast appears at top-right (desktop) or top-center (mobile) with slide-in animation. Auto-dismisses after specified duration unless `showRetry` is true.

### Error Recovery Strategies

**Form Validation Errors**:
- User corrects input → Error clears automatically on next validation
- All errors must be resolved before submission succeeds

**Network/Timeout Errors**:
- User clicks "Retry" → System resends request with same payload
- User refreshes page → Form data lost (consider localStorage persistence for enhancement)

**Authentication Errors**:
- Failed login → User modifies credentials and retries
- Session expired → User redirected to login, returned to original page after authentication

**Server Errors**:
- User waits and retries
- If persistent, user contacts support (future: display support link)



### Global Error Boundary

Implement React Error Boundary to catch unexpected errors:

```typescript
class AuthErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Auth Error:', error, errorInfo);
    // Future: Send to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```



## Testing Strategy

### Overview

The testing strategy employs a dual approach combining **unit tests** for specific examples and edge cases with **property-based tests** for validation logic that must hold across infinite input variations. This comprehensive approach ensures both concrete behavior verification and universal correctness guarantees.

### Unit Testing

**Framework**: Jest with React Testing Library

**Scope**: Component rendering, UI interactions, state management, specific scenarios

#### Login Form Tests
```typescript
describe('LoginForm', () => {
  test('renders with mobile number and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
  
  test('displays loading spinner during submission', async () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  test('shows error message on 401 response', async () => {
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
      })
    );
    render(<LoginForm />);
    // ... fill form and submit
    expect(await screen.findByText(/invalid mobile number or password/i)).toBeInTheDocument();
  });
  
  test('redirects to dashboard on successful login', async () => {
    // ... test implementation
  });
});
```



#### Register Form Tests
```typescript
describe('RegisterForm', () => {
  test('renders name, mobile number, and password inputs', () => {
    // ... test implementation
  });
  
  test('displays password strength indicator', () => {
    render(<RegisterForm />);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'test123' } });
    expect(screen.getByText(/weak|fair|good|strong/i)).toBeInTheDocument();
  });
  
  test('shows "Too Short" for passwords < 8 characters', () => {
    // ... test implementation
  });
  
  test('shows 409 error for duplicate mobile number', async () => {
    // ... test implementation
  });
});
```

#### Profile Form Tests
```typescript
describe('ProfileForm', () => {
  test('displays loading skeleton while fetching', () => {
    render(<ProfileForm />);
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });
  
  test('populates fields with fetched profile data', async () => {
    server.use(
      rest.get('/api/profile', (req, res, ctx) => {
        return res(ctx.json({
          name: 'John Doe',
          mobileNumber: '+919999999999',
          dailyTargetStudyHours: 8
        }));
      })
    );
    render(<ProfileForm />);
    expect(await screen.findByDisplayValue('John Doe')).toBeInTheDocument();
  });
  
  test('enables save button when form is modified', () => {
    // ... test implementation
  });
  
  test('displays success toast on successful save', async () => {
    // ... test implementation
  });
});
```



### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Scope**: Validation logic, password strength calculation, error handling

**Configuration**: Minimum 100 iterations per property test

#### Installation
```bash
npm install --save-dev fast-check
```

#### Property Test Examples

**Property 1: Mobile Number Validation Correctness**
```typescript
import fc from 'fast-check';

describe('Mobile Number Validation Properties', () => {
  test('Property 1: Mobile Number Validation Correctness - Feature: enhanced-login-profile-system, Property 1: For any string input, validation returns error iff length < 8 OR length > 16 OR contains invalid chars', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (input) => {
          const error = validateMobileNumber(input);
          const hasInvalidLength = input.length < 8 || input.length > 16;
          const hasInvalidChars = !/^[+0-9\s]*$/.test(input);
          const shouldHaveError = hasInvalidLength || hasInvalidChars || input.length === 0;
          
          if (shouldHaveError) {
            expect(error).toBeDefined();
          } else {
            expect(error).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('accepts valid formats with country codes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 8, max: 15 }).chain(len =>
          fc.tuple(
            fc.constant('+'),
            fc.array(fc.integer({ min: 0, max: 9 }), { minLength: len, maxLength: len })
          )
        ),
        ([prefix, digits]) => {
          const mobile = prefix + digits.join('');
          expect(validateMobileNumber(mobile)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```



**Property 2 & 3: Password Strength Calculation**
```typescript
describe('Password Strength Properties', () => {
  test('Property 2: Password Strength Calculation Determinism - Feature: enhanced-login-profile-system, Property 2: Same input produces same output', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 8, maxLength: 20 }),
        (password) => {
          const result1 = calculatePasswordStrength(password);
          const result2 = calculatePasswordStrength(password);
          
          expect(result1.score).toBe(result2.score);
          expect(result1.label).toBe(result2.label);
          expect(result1.color).toBe(result2.color);
          expect(result1.suggestions).toEqual(result2.suggestions);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('Property 3: Password Strength Monotonicity - Feature: enhanced-login-profile-system, Property 3: Adding character diversity does not decrease score', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 8, maxLength: 15 }).filter(s => /^[a-z]+$/.test(s)),
        (basePassword) => {
          const baseScore = calculatePasswordStrength(basePassword).score;
          
          // Add uppercase
          const withUpper = basePassword + 'A';
          const upperScore = calculatePasswordStrength(withUpper).score;
          expect(upperScore).toBeGreaterThanOrEqual(baseScore);
          
          // Add number
          const withNumber = withUpper + '1';
          const numberScore = calculatePasswordStrength(withNumber).score;
          expect(numberScore).toBeGreaterThanOrEqual(upperScore);
          
          // Add special char
          const withSpecial = withNumber + '!';
          const specialScore = calculatePasswordStrength(withSpecial).score;
          expect(specialScore).toBeGreaterThanOrEqual(numberScore);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```



**Property 4: Validation Error Prevention**
```typescript
describe('Form Validation Properties', () => {
  test('Property 4: Validation Error Prevention - Feature: enhanced-login-profile-system, Property 4: Invalid data prevents submission and shows errors', () => {
    fc.assert(
      fc.property(
        fc.record({
          mobileNumber: fc.string(),
          password: fc.string(),
          name: fc.option(fc.string(), { nil: undefined })
        }),
        (formData) => {
          const errors = validateForm(formData);
          const hasErrors = Object.keys(errors).length > 0;
          const shouldPreventSubmission = !isFormValid(formData);
          
          if (shouldPreventSubmission) {
            expect(hasErrors).toBe(true);
            expect(Object.keys(errors).length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 5: Error Message Display Completeness**
```typescript
test('Property 5: Error Message Display Completeness - Feature: enhanced-login-profile-system, Property 5: All errors displayed simultaneously', () => {
  fc.assert(
    fc.property(
      fc.record({
        name: fc.string({ maxLength: 1 }), // Invalid
        mobileNumber: fc.string({ maxLength: 5 }), // Invalid
        password: fc.string({ maxLength: 6 }), // Invalid
      }),
      (invalidFormData) => {
        const errors = validateForm(invalidFormData);
        
        // Should have errors for all three fields
        expect(Object.keys(errors).length).toBeGreaterThanOrEqual(3);
        expect(errors.name).toBeDefined();
        expect(errors.mobileNumber).toBeDefined();
        expect(errors.password).toBeDefined();
      }
    ),
    { numRuns: 100 }
  );
});
```



**Property 6 & 7: Profile Validation**
```typescript
describe('Profile Validation Properties', () => {
  test('Property 6: Profile Validation Boundary Enforcement - Feature: enhanced-login-profile-system, Property 6: Negative values rejected, excessive values warned', () => {
    fc.assert(
      fc.property(
        fc.record({
          dailyTargetStudyHours: fc.integer(),
          dailyTargetCodingHours: fc.integer(),
          dailyTargetGymTime: fc.integer()
        }),
        (profileData) => {
          const errors = validateProfileNumericFields(profileData);
          
          // Negative values should have errors
          if (profileData.dailyTargetStudyHours < 0) {
            expect(errors.dailyTargetStudyHours).toContain('cannot be negative');
          }
          if (profileData.dailyTargetCodingHours < 0) {
            expect(errors.dailyTargetCodingHours).toContain('cannot be negative');
          }
          if (profileData.dailyTargetGymTime < 0) {
            expect(errors.dailyTargetGymTime).toContain('cannot be negative');
          }
          
          // Excessive values should have warnings (not errors)
          if (profileData.dailyTargetStudyHours > 24) {
            expect(errors.dailyTargetStudyHours).toContain('exceed');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('Property 7: Name Validation Minimum Length - Feature: enhanced-login-profile-system, Property 7: Names < 2 chars rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 1 }),
        (shortName) => {
          const error = validateName(shortName);
          expect(error).toBeDefined();
          expect(error).toContain('at least 2 characters');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```



**Property 8: Error Handling Message Mapping**
```typescript
test('Property 8: Error Handling Message Mapping - Feature: enhanced-login-profile-system, Property 8: Status codes map to correct messages', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(400, 401, 409, 500),
      (statusCode) => {
        const mockResponse = { status: statusCode } as Response;
        const message = handleApiError(mockResponse, 'Default message');
        
        switch (statusCode) {
          case 400:
            expect(message).toContain('Invalid request');
            break;
          case 401:
            expect(message).toContain('Invalid mobile number or password');
            break;
          case 409:
            expect(message).toContain('already registered');
            break;
          case 500:
            expect(message).toContain('Server error');
            break;
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**Framework**: Playwright or Cypress

**Scope**: End-to-end user flows, API integration, route protection

#### Test Scenarios

1. **Complete Registration Flow**
   - User fills registration form → Submits → API creates account → Redirects to dashboard
   
2. **Complete Login Flow**
   - User enters credentials → Submits → API authenticates → Redirects to dashboard
   
3. **Profile Update Flow**
   - User loads profile → Data fetched → User modifies fields → Saves → Success toast appears

4. **Route Protection**
   - Unauthenticated user attempts to access /dashboard → Redirected to /login
   - Authenticated user accesses /login → Redirected to /dashboard

5. **Error Recovery**
   - Network failure during login → Error displayed with retry button → User retries → Success



### Accessibility Testing

**Tools**: jest-axe, Lighthouse, manual testing with screen readers

#### Test Areas

1. **ARIA Compliance**
   - All form inputs have associated labels
   - Error messages use `role="alert"` and `aria-live="polite"`
   - Loading states announce to screen readers
   - Disabled buttons have `aria-disabled` attributes

2. **Keyboard Navigation**
   - All interactive elements reachable via Tab
   - Focus order follows visual layout
   - Focus indicators visible and meet contrast requirements
   - No keyboard traps

3. **Screen Reader Testing**
   - Test with NVDA (Windows) and VoiceOver (Mac)
   - Verify all form labels are announced
   - Verify validation errors are announced
   - Verify loading states are announced

### Performance Testing

**Metrics**:
- Page load time < 2 seconds
- Time to interactive < 3 seconds
- Form validation response < 100ms
- API call timeout set to 30 seconds

**Tools**: Lighthouse, WebPageTest

### Test Coverage Goals

- **Unit Tests**: 80% code coverage minimum
- **Property Tests**: 100% coverage of validation functions
- **Integration Tests**: All critical user flows covered
- **Accessibility Tests**: WCAG 2.1 AA compliance

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:property
      - run: npm run test:integration
      - run: npm run test:a11y
```

