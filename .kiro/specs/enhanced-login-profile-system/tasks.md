# Implementation Plan: Enhanced Login & Profile System

## Overview

This implementation plan transforms the DevTrack AI authentication and profile management system from basic HTML form submission to a modern React-based interface with comprehensive client-side validation, real-time feedback, smooth animations, and full API integration. The implementation is organized into logical phases: utility functions, reusable UI components, page conversions, route protection, server-side updates, and testing.

## Tasks

- [ ] 1. Create validation utility functions and API client
  - [ ] 1.1 Create validation utilities module at `src/lib/validation.ts`
    - Implement `validateMobileNumber(mobile: string): string | undefined` - returns error message if invalid
    - Implement `validatePassword(password: string): string | undefined` - returns error message if invalid
    - Implement `validateName(name: string): string | undefined` - returns error message if invalid
    - Implement `validateProfileField(field: string, value: any): string | undefined` - validates profile numeric fields
    - Use Zod schemas for validation rules
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  
  - [ ]* 1.2 Write property test for mobile number validation
    - **Property 1: Mobile Number Validation Correctness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
    - Use fast-check to generate arbitrary strings
    - Verify error returned iff length < 8 OR length > 16 OR contains invalid chars
  
  - [ ] 1.3 Create password strength calculator at `src/lib/passwordStrength.ts`
    - Implement `calculatePasswordStrength(password: string): StrengthMetrics` function
    - Return object with score (0-5), label, color, percentage, and suggestions array
    - Apply algorithm: score 0 for <8 chars, increment for lowercase, uppercase, numbers, special chars
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8_
  
  - [ ]* 1.4 Write property tests for password strength calculation
    - **Property 2: Password Strength Calculation Determinism**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6, 3.8**
    - **Property 3: Password Strength Monotonicity**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6**
    - Verify same input produces same output (determinism)
    - Verify adding character diversity never decreases score (monotonicity)
  
  - [ ] 1.5 Create API client module at `src/lib/api/auth.ts`
    - Implement `loginUser(data: LoginRequest): Promise<void>` - POST to /api/auth/login
    - Implement `registerUser(data: RegisterRequest): Promise<void>` - POST to /api/auth/register
    - Implement `fetchProfile(): Promise<ProfileResponse>` - GET from /api/profile
    - Implement `updateProfile(data: ProfileUpdateRequest): Promise<void>` - PATCH to /api/profile
    - Include proper headers, credentials, error handling, and TypeScript types
    - _Requirements: 1.6, 1.8, 6.3, 7.1, 8.2, 18.7_
  
  - [ ] 1.6 Create error handling utilities at `src/lib/errorHandler.ts`
    - Implement `getErrorMessage(error: unknown): string` - extracts user-friendly messages
    - Implement `handleApiError(response: Response, defaultMessage: string): string` - maps status codes to messages
    - Map 400 → "Invalid request", 401 → "Invalid mobile number or password", 409 → "Mobile number already registered", 500 → "Server error"
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 18.5_

- [ ] 2. Create reusable UI components
  - [ ] 2.1 Create FormInput component at `src/components/ui/FormInput.tsx`
    - Accept props: label, name, type, value, onChange, onBlur, error, placeholder, disabled, required, autoComplete, className
    - Render label with required indicator (*) if required=true
    - Display input with focus ring animation (150ms transition)
    - Display error message below input with red color and XCircle icon
    - Include proper ARIA attributes: aria-invalid, aria-describedby, aria-required
    - _Requirements: 4.2, 12.5, 12.7, 13.1, 13.2, 13.7_
  
  - [ ] 2.2 Create PasswordInput component at `src/components/ui/PasswordInput.tsx`
    - Extend FormInput component with show/hide password toggle button
    - Display Eye/EyeOff icon from lucide-react
    - Toggle between type="password" and type="text" on button click
    - Position toggle button inside input field on the right
    - _Requirements: 15.1, 15.2, 15.3, 15.7_
  
  - [ ] 2.3 Create PasswordStrengthIndicator component at `src/components/ui/PasswordStrengthIndicator.tsx`
    - Accept password prop and call calculatePasswordStrength utility
    - Display strength label with appropriate color (red/orange/yellow/light-green/green)
    - Display animated progress bar showing percentage (300ms ease-out transition)
    - Display suggestions list below progress bar ("Add numbers", "Add special characters", etc.)
    - Include ARIA live region to announce strength changes to screen readers
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 13.5, 16.7_
  
  - [ ] 2.4 Create Toast notification component at `src/components/ui/Toast.tsx`
    - Accept props: message, type ('success' | 'error' | 'warning' | 'info'), duration, onClose
    - Display with appropriate icon: CheckCircle for success, XCircle for error
    - Position fixed at top-right on desktop, top-center on mobile
    - Implement slide-in animation from top (300ms duration)
    - Auto-dismiss after duration (default 3000ms)
    - Include close button for manual dismissal
    - _Requirements: 8.4, 8.5, 11.4, 11.5, 16.4_
  
  - [ ] 2.5 Create LoadingSkeleton component at `src/components/ui/LoadingSkeleton.tsx`
    - Create skeleton for profile form layout: 2 inputs first row, 1 full-width second row, 3 inputs third row, 1 button fourth row
    - Use Tailwind's animate-pulse class for animation
    - Match dimensions and spacing of actual form fields
    - _Requirements: 7.2, 11.3_

- [ ] 3. Checkpoint - Verify utilities and components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Convert login page to client component with validation
  - [ ] 4.1 Update login page at `src/app/(auth)/login/page.tsx`
    - Add "use client" directive at top of file
    - Implement LoginFormState interface with mobileNumber, password, rememberMe, showPassword, errors, isLoading
    - Use useState hooks for all form state management
    - Implement handleInputChange, validateField, validateForm, handleSubmit functions
    - Integrate FormInput and PasswordInput components
    - Add Remember Me checkbox below password field
    - Add "Forgot Password?" link (show alert for "Coming soon" on click)
    - Display loading spinner in submit button during API request
    - Call loginUser API function on submit with error handling
    - Redirect to /dashboard on success
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 17.1, 17.2, 17.3, 17.4, 17.5_
  
  - [ ]* 4.2 Write unit tests for login page
    - Test form rendering with all required fields
    - Test loading state display during submission
    - Test error display on 401 response
    - Test redirect to dashboard on success
    - Test Remember Me checkbox functionality
  
  - [ ]* 4.3 Write property test for login form validation
    - **Property 4: Validation Error Prevention**
    - **Validates: Requirements 1.5, 9.8**
    - Verify form submission prevented when validation fails
    - Verify at least one error message displayed

- [ ] 5. Convert register page to client component with password strength
  - [ ] 5.1 Update register page at `src/app/(auth)/register/page.tsx`
    - Add "use client" directive at top of file
    - Implement RegisterFormState interface with name, mobileNumber, password, showPassword, passwordStrength, errors, isLoading
    - Use useState hooks for all form state management
    - Integrate FormInput, PasswordInput, and PasswordStrengthIndicator components
    - Calculate and display password strength in real-time as user types
    - Prevent submission if password length < 8 characters
    - Call registerUser API function on submit with error handling
    - Display 409 error specifically for duplicate mobile numbers
    - Redirect to /dashboard on success
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 17.1, 17.2, 17.3, 17.4, 17.5_
  
  - [ ]* 5.2 Write unit tests for register page
    - Test form rendering with name, mobile, and password fields
    - Test password strength indicator display
    - Test "Too Short" display for passwords < 8 characters
    - Test 409 error handling for duplicate mobile numbers
    - Test successful registration and redirect

- [ ] 6. Checkpoint - Verify authentication pages
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Convert profile page to client component with API integration
  - [ ] 7.1 Update profile page at `src/app/(app)/profile/page.tsx`
    - Add "use client" directive at top of file
    - Implement ProfileFormState interface with form data fields, errors, isLoading, isFetching, isSaving, isDirty, toast
    - Use useState and useEffect hooks for state management
    - Call fetchProfile on component mount in useEffect
    - Display LoadingSkeleton while isFetching is true
    - Populate form fields with fetched data on success
    - Track isDirty flag when user modifies any field
    - Integrate FormInput components for all fields (name, mobile, profession, study hours, coding hours, gym time)
    - Validate all fields before saving with validateProfileField utility
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.6, 17.1, 17.2, 17.3, 17.4, 17.5, 17.7_
  
  - [ ] 7.2 Implement profile update functionality
    - Implement handleSave function that validates and calls updateProfile API
    - Display loading spinner on save button during API request
    - Show success toast notification on successful save
    - Show error toast notification on failure with retry option
    - Send only modified fields in PATCH request (check isDirty per field)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7, 11.1, 11.2, 18.1, 18.2_
  
  - [ ]* 7.3 Write unit tests for profile page
    - Test loading skeleton display during fetch
    - Test form population with fetched data
    - Test save button enabling when form is modified
    - Test success toast display on save
    - Test error handling for failed fetch
  
  - [ ]* 7.4 Write property tests for profile validation
    - **Property 5: Error Message Display Completeness**
    - **Validates: Requirements 12.6**
    - **Property 6: Profile Validation Boundary Enforcement**
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6, 9.7**
    - **Property 7: Name Validation Minimum Length**
    - **Validates: Requirements 9.1**
    - Verify all errors displayed simultaneously
    - Verify negative values rejected for numeric fields
    - Verify warnings (not errors) for values exceeding maximums
    - Verify name < 2 characters rejected

- [ ] 8. Implement route protection middleware
  - [ ] 8.1 Create or update middleware at `src/middleware.ts`
    - Check for authentication token in cookies
    - Define protected routes: /dashboard, /profile, /tasks, /goals, /habits, /timer, /analytics, /ai-insights, /activity, /routine
    - Redirect unauthenticated users from protected routes to /login
    - Redirect authenticated users from /login and /register to /dashboard
    - Use NextResponse.redirect for route redirects
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_
  
  - [ ]* 8.2 Write unit tests for middleware
    - Test redirect to /login for unauthenticated users accessing protected routes
    - Test redirect to /dashboard for authenticated users accessing /login
    - Test authenticated users can access protected routes

- [ ] 9. Update server-side API endpoints for JSON support
  - [ ] 9.1 Update login API route at `src/app/api/auth/login/route.ts`
    - Change to accept JSON request body instead of FormData
    - Parse request body with `await request.json()`
    - Extract mobileNumber, password, rememberMe from parsed JSON
    - Return JSON error responses with appropriate status codes (400, 401)
    - Keep JWT cookie creation and redirect logic on success
    - _Requirements: 1.6, 12.1, 18.7_
  
  - [ ] 9.2 Update register API route at `src/app/api/auth/register/route.ts`
    - Change to accept JSON request body instead of FormData
    - Parse request body with `await request.json()`
    - Extract name, mobileNumber, password from parsed JSON
    - Return JSON error responses with appropriate status codes (400, 409 for duplicate)
    - Keep JWT cookie creation and redirect logic on success
    - _Requirements: 1.6, 12.2, 18.7_
  
  - [ ] 9.3 Verify profile API routes at `src/app/api/profile/route.ts`
    - Ensure GET endpoint returns proper JSON response with all profile fields
    - Ensure PATCH endpoint accepts JSON body with partial profile updates
    - Ensure proper error responses (400, 401, 500) with JSON error messages
    - _Requirements: 7.1, 7.4, 8.2, 12.3, 12.5_

- [ ] 10. Checkpoint - Verify API integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Add UI/UX enhancements and animations
  - [ ] 11.1 Add form styling and animations to login page
    - Apply gradient background and modern card styling with shadows
    - Add smooth focus transitions with colored borders (150ms duration)
    - Add button hover animations: scale to 1.02 and shadow (200ms duration)
    - Add fade-in/fade-out animations for error messages (200ms duration)
    - Ensure responsive design works on mobile (320px minimum width)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 16.1, 16.2, 16.5, 16.6_
  
  - [ ] 11.2 Add form styling and animations to register page
    - Apply same gradient background and card styling as login
    - Add same focus transitions and button hover animations
    - Ensure responsive design works on mobile (320px minimum width)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 16.1, 16.2, 16.5, 16.6_
  
  - [ ] 11.3 Add form styling and animations to profile page
    - Apply consistent card styling with shadows
    - Add focus transitions and button hover animations
    - Ensure responsive design: single column below 768px, two-column grid on desktop
    - _Requirements: 4.2, 4.3, 14.4, 14.5, 16.5, 16.6_

- [ ] 12. Implement accessibility features
  - [ ] 12.1 Add ARIA attributes to all form components
    - Ensure FormInput includes aria-label, aria-invalid, aria-describedby, aria-required
    - Ensure buttons include aria-disabled when disabled
    - Add aria-live regions for error announcements
    - Add role="alert" to error messages
    - Add role="status" to loading spinners
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ] 12.2 Verify keyboard navigation
    - Test Tab and Shift+Tab navigation through all form fields
    - Ensure focus indicators meet WCAG 2.1 AA contrast requirements
    - Verify Enter key submits forms
    - Verify Escape key closes modals and toasts
    - _Requirements: 13.6, 13.7, 13.8_

- [ ] 13. Implement mobile responsiveness
  - [ ] 13.1 Test and fix mobile layouts for authentication pages
    - Verify no horizontal scrolling on 320px screens
    - Ensure touch targets are minimum 44x44px
    - Use input type="tel" for mobile number fields
    - Use minimum 16px font size to prevent iOS zoom
    - Test keyboard appearance and input visibility
    - _Requirements: 14.1, 14.2, 14.3, 14.6, 14.7_
  
  - [ ] 13.2 Test and fix mobile layouts for profile page
    - Verify single column layout on screens below 768px
    - Verify two-column grid on desktop (>768px)
    - Ensure touch targets are minimum 44x44px
    - Test keyboard appearance and field visibility
    - _Requirements: 14.4, 14.5, 14.6_

- [ ] 14. Final integration and polish
  - [ ] 14.1 Add page transition animations
    - Implement smooth page transitions between login/register/dashboard
    - Use fade or slide animations (300ms duration)
    - _Requirements: 4.8, 16.8_
  
  - [ ] 14.2 Implement network error retry functionality
    - Add "Retry" button to network error toast notifications
    - Implement retry logic in API client functions
    - Add timeout handling (30 second limit) with timeout error message
    - Implement debouncing to prevent duplicate submissions
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.6_
  
  - [ ]* 14.3 Write integration tests
    - Test complete login flow from form submission to dashboard redirect
    - Test complete registration flow from form submission to dashboard redirect
    - Test complete profile update flow from fetch to save
    - Test route protection middleware with authenticated and unauthenticated users
  
  - [ ]* 14.4 Write property test for error handling
    - **Property 8: Error Handling Message Mapping**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.5**
    - Generate arbitrary HTTP status codes
    - Verify correct error messages returned for 400, 401, 409, 500

- [ ] 15. Final checkpoint - Comprehensive testing
  - Ensure all tests pass, ask the user if questions arise.
  - Test the complete user journey: registration → login → profile update
  - Verify all validation rules work correctly
  - Verify all error scenarios display appropriate messages
  - Verify all animations and transitions are smooth
  - Verify accessibility with screen reader testing
  - Verify mobile responsiveness on various screen sizes

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties across infinite inputs
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript with Next.js 15 App Router and React 19
- All API calls use native Fetch API with proper error handling
- Authentication uses HTTP-only cookies managed server-side
- The UI uses Tailwind CSS 4 for styling with smooth animations
- Accessibility follows WCAG 2.1 AA standards
- Mobile-first responsive design supports screens from 320px width

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3", "1.5", "1.6"] },
    { "id": 1, "tasks": ["1.2", "1.4", "2.1", "2.5"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["4.1", "5.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "5.2"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.2"] },
    { "id": 7, "tasks": ["7.3", "7.4", "8.1", "9.1", "9.2", "9.3"] },
    { "id": 8, "tasks": ["8.2", "11.1", "11.2", "11.3"] },
    { "id": 9, "tasks": ["12.1", "12.2", "13.1", "13.2"] },
    { "id": 10, "tasks": ["14.1", "14.2"] },
    { "id": 11, "tasks": ["14.3", "14.4"] }
  ]
}
```
