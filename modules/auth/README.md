# Auth Module

## Purpose
Handle user authentication, registration, and session management via Appwrite.

## Features
- Email/password registration & login
- OAuth (Google) - future
- Password reset flow
- Session management
- Profile creation on signup

## Dependencies
- Appwrite Auth SDK
- next-intl for translations

## Database Collections
None (uses Appwrite Auth)

## Routes
| Route | View | Description |
|-------|------|-------------|
| /auth/login | LoginView | User login |
| /auth/register | RegisterView | User registration |
| /auth/forgot-password | ForgotPasswordView | Password reset |

## Key Files
```
modules/auth/
├── index.ts                         # Public exports
├── README.md                        # This file
├── config/
│   ├── index.ts                     # Re-exports
│   ├── routes.ts                    # Route constants
│   └── messages.ts                  # Error/success messages
├── types/
│   ├── index.ts                     # Type exports
│   └── auth.types.ts                # Type definitions
├── lib/
│   └── validation.ts                # Zod schemas
├── hooks/
│   ├── index.ts                     # Hook exports
│   └── mutations/
│       └── use-auth-mutations.ts    # Auth mutation hooks
├── server/
│   ├── procedures.ts                # tRPC router
│   └── services/
│       └── auth.service.ts          # Business logic
└── ui/
    ├── views/
    │   ├── login-view.tsx           # Login page view
    │   └── register-view.tsx        # Register page view
    └── components/
        └── forms/
            ├── login-form.tsx       # Login form
            └── register-form.tsx    # Register form
```

## Usage

### Import Components
```tsx
import { LoginView, RegisterView } from "@/modules/auth";
```

### Import Hooks
```tsx
import { useLogin, useRegister } from "@/modules/auth";
```
