# Authentication System Documentation

## Overview

Complete authentication system for CBSE Educational App with student and parent roles, JWT-based sessions, and role-based access control.

---

## Architecture

### 1. Authentication Flow

#### **Student Signup**
```typescript
// Frontend: Use tRPC mutation
const signup = trpc.auth.signupStudent.useMutation();

await signup.mutateAsync({
  email: "student@example.com",
  password: "password123",
  fullName: "John Doe",
  grade: 10,
  board: "CBSE",
  dateOfBirth: "2008-05-15", // optional
  schoolName: "XYZ School"   // optional
});
```

**Backend Process:**
1. Creates user in `auth.users` (Supabase Auth)
2. Creates record in `public.users` with role='student'
3. Creates student profile in `public.student_profiles`
4. Returns JWT session + profile data
5. On failure: Rolls back auth user creation

#### **Parent Signup**
```typescript
const signup = trpc.auth.signupParent.useMutation();

await signup.mutateAsync({
  email: "parent@example.com",
  password: "password123",
  fullName: "Jane Doe",
  phoneNumber: "+1234567890" // optional
});
```

**Backend Process:**
1. Creates user in `auth.users`
2. Creates record in `public.users` with role='parent'
3. Creates parent profile in `public.parent_profiles`
4. Returns JWT session + profile data

#### **Login**
```typescript
const login = trpc.auth.login.useMutation();

const result = await login.mutateAsync({
  email: "user@example.com",
  password: "password123"
});

// Returns: { user, session, profile }
// Profile type depends on role (StudentProfileResponse | ParentProfileResponse)
```

**Backend Process:**
1. Authenticates via Supabase Auth
2. Fetches user role from `public.users`
3. Fetches profile (student or parent) with related data
4. Updates `last_login_at` timestamp
5. Returns session + typed profile

#### **Logout**
```typescript
const logout = trpc.auth.logout.useMutation();
await logout.mutateAsync();
```

---

### 2. Session Management

**Token Storage:**
- Mobile: AsyncStorage (`@auth_session`)
- Web: localStorage (via Supabase client)
- Auto-refresh: Enabled (7-day refresh token)

**Token Lifecycle:**
- Access token: 1 hour validity
- Refresh token: 7 days validity
- Auto-refresh handled by Supabase client

**AuthContext Hook:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

function Component() {
  const {
    session,       // Supabase session object
    profile,       // StudentProfileResponse | ParentProfileResponse
    role,          // 'student' | 'parent' | 'admin'
    isLoading,     // Boolean
    isAuthenticated, // Boolean
    signOut,       // Function
    refreshProfile // Function
  } = useAuth();

  if (isLoading) return <LoadingScreen />;
  
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (role === 'student') {
    // profile is StudentProfileResponse
    return <StudentDashboard profile={profile} />;
  }

  if (role === 'parent') {
    // profile is ParentProfileResponse
    return <ParentDashboard profile={profile} />;
  }
}
```

---

### 3. Middleware Strategy

#### **tRPC Context Enhancement**
Location: `backend/trpc/create-context.ts`

Every tRPC request automatically:
1. Extracts `Authorization: Bearer <token>` header
2. Validates JWT with Supabase Auth
3. Fetches user role from database
4. Attaches to context: `{ userId, userEmail, userRole }`

#### **Available Procedures**

**publicProcedure** - No authentication required
```typescript
export const publicRoute = publicProcedure
  .query(async ({ ctx }) => {
    // Anyone can access
    return { data: "public" };
  });
```

**protectedProcedure** - Requires authentication
```typescript
export const protectedRoute = protectedProcedure
  .query(async ({ ctx }) => {
    // ctx.userId, ctx.userEmail, ctx.userRole available
    // Throws UNAUTHORIZED if not authenticated
    return { userId: ctx.userId };
  });
```

**studentProcedure** - Student role required
```typescript
export const studentRoute = studentProcedure
  .query(async ({ ctx }) => {
    // ctx.userRole === 'student' guaranteed
    // Throws FORBIDDEN if not student
    return { studentData: "..." };
  });
```

**parentProcedure** - Parent role required
```typescript
export const parentRoute = parentProcedure
  .query(async ({ ctx }) => {
    // ctx.userRole === 'parent' guaranteed
    return { parentData: "..." };
  });
```

**adminProcedure** - Admin role required
```typescript
export const adminRoute = adminProcedure
  .mutation(async ({ ctx }) => {
    // ctx.userRole === 'admin' guaranteed
    return { success: true };
  });
```

---

### 4. Role-Based Access Control

#### **Database-Level (RLS Policies)**
Already configured in `supabase-schema-complete.sql`:

**Students can:**
- View/update own profile
- Manage own data (uploads, quizzes, progress, etc.)
- View public subjects/chapters

**Parents can:**
- View/update own profile
- View linked students' data (progress, quizzes, etc.)
- Manage rewards for linked students
- Cannot modify student data

**Admins:**
- Full access to all tables (via RLS policies)

#### **Application-Level (Route Protection)**

**Frontend Route Protection:**
```typescript
// app/_layout.tsx
import { useAuth } from '@/contexts/AuthContext';

export default function RootLayout() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login/onboarding
    return <Redirect href="/onboarding" />;
  }

  return <Slot />;
}
```

**Role-specific screens:**
```typescript
// app/student-dashboard.tsx
function StudentDashboard() {
  const { role, profile } = useAuth();
  
  if (role !== 'student') {
    return <Redirect href="/unauthorized" />;
  }

  return <StudentDashboardUI profile={profile} />;
}

// app/parent-dashboard.tsx
function ParentDashboard() {
  const { role, profile } = useAuth();
  
  if (role !== 'parent') {
    return <Redirect href="/unauthorized" />;
  }

  return <ParentDashboardUI profile={profile} />;
}
```

---

## API Endpoints (tRPC)

### Authentication Routes

#### `auth.signupStudent`
- **Type:** Mutation
- **Access:** Public
- **Input:** `SignupStudentInput`
- **Output:** `{ user, session, profile: StudentProfileResponse }`
- **Errors:** BAD_REQUEST, INTERNAL_SERVER_ERROR

#### `auth.signupParent`
- **Type:** Mutation
- **Access:** Public
- **Input:** `SignupParentInput`
- **Output:** `{ user, session, profile: ParentProfileResponse }`
- **Errors:** BAD_REQUEST, INTERNAL_SERVER_ERROR

#### `auth.login`
- **Type:** Mutation
- **Access:** Public
- **Input:** `LoginInput`
- **Output:** `{ user, session, profile }`
- **Errors:** UNAUTHORIZED, INTERNAL_SERVER_ERROR

#### `auth.logout`
- **Type:** Mutation
- **Access:** Public
- **Output:** `{ success: true }`

#### `auth.me`
- **Type:** Query
- **Access:** Protected
- **Output:** `{ user, profile } | null`

#### `auth.linkStudent`
- **Type:** Mutation
- **Access:** Parent only
- **Input:** `LinkStudentInput`
- **Output:** `{ success: true, linkId: string }`
- **Errors:** NOT_FOUND, BAD_REQUEST, FORBIDDEN

---

## Parent-Student Linking

**Process:**
1. Parent logs in
2. Parent provides student's email
3. System validates student exists with role='student'
4. Creates link in `student_parent_links` table
5. Parent can now view student's progress

**Usage:**
```typescript
const linkStudent = trpc.auth.linkStudent.useMutation();

await linkStudent.mutateAsync({
  studentEmail: "student@example.com",
  relationship: "Father",  // optional
  isPrimary: true          // optional
});
```

---

## Type Definitions

All types available in `backend/types/auth.ts`:

```typescript
// Input types
SignupStudentInput
SignupParentInput
LoginInput
LinkStudentInput

// User types
UserRole = 'student' | 'parent' | 'admin'
AuthUser

// Response types
StudentProfileResponse
ParentProfileResponse
AuthResponse
```

---

## Security Features

✅ **JWT-based authentication** (Supabase Auth)  
✅ **Automatic token refresh** (7-day refresh tokens)  
✅ **Row-level security (RLS)** on all tables  
✅ **Role-based middleware** (tRPC procedures)  
✅ **Password hashing** (handled by Supabase)  
✅ **Session persistence** (AsyncStorage/localStorage)  
✅ **HTTPS required** (production)  
✅ **CORS configured** (backend)  
✅ **XSS protection** (React Native)  

---

## Error Handling

**Frontend:**
```typescript
const login = trpc.auth.login.useMutation({
  onError: (error) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      Alert.alert('Error', 'Invalid email or password');
    } else {
      Alert.alert('Error', 'Something went wrong');
    }
  }
});
```

**Backend Error Codes:**
- `UNAUTHORIZED` - Invalid credentials or session
- `FORBIDDEN` - Insufficient permissions
- `BAD_REQUEST` - Invalid input data
- `NOT_FOUND` - Resource doesn't exist
- `INTERNAL_SERVER_ERROR` - Server error

---

## Testing

**Test Student Account:**
```
Email: student@test.com
Password: test1234
Role: student
Grade: 10
```

**Test Parent Account:**
```
Email: parent@test.com
Password: test1234
Role: parent
```

---

## Phase 1 MVP Implementation Status

✅ **Models Created:**
- `backend/types/auth.ts` - All auth types and schemas

✅ **Routes Implemented:**
- `auth.signupStudent` - Student registration
- `auth.signupParent` - Parent registration
- `auth.login` - Email/password login
- `auth.logout` - Session termination
- `auth.me` - Get current user
- `auth.linkStudent` - Parent-student linking

✅ **Middleware Created:**
- Context enhancement with JWT extraction
- `protectedProcedure` - Auth required
- `studentProcedure` - Student role required
- `parentProcedure` - Parent role required
- `adminProcedure` - Admin role required

✅ **Client Integration:**
- AuthContext provider with React Query
- Auto-attach JWT to tRPC requests
- Session persistence with AsyncStorage

---

## Next Steps (Phase 2/3)

**Phase 2:**
- [ ] Password reset flow
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Social auth (Google, Apple)
- [ ] Student invite codes (instead of email)

**Phase 3:**
- [ ] Session management dashboard
- [ ] Device tracking
- [ ] Suspicious activity alerts
- [ ] Account deletion flow
- [ ] GDPR compliance features

---

## Usage Examples

### Complete Auth Flow Example

```typescript
// App.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';

const queryClient = new QueryClient();

export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// Login Screen
function LoginScreen() {
  const login = trpc.auth.login.useMutation();
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login.mutateAsync({ email, password });
      
      if (result.user.role === 'student') {
        router.push('/dashboard');
      } else {
        router.push('/parent');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}

// Protected Screen
function Dashboard() {
  const { profile, role, signOut } = useAuth();

  if (role !== 'student') {
    return <Redirect href="/unauthorized" />;
  }

  return (
    <View>
      <Text>Welcome, {profile.fullName}!</Text>
      <Text>Grade: {profile.grade}</Text>
      <Button onPress={signOut} title="Logout" />
    </View>
  );
}
```

---

## Troubleshooting

**Session not persisting:**
- Check AsyncStorage permissions
- Verify Supabase client config has `persistSession: true`

**UNAUTHORIZED errors:**
- Check if JWT token is being sent in headers
- Verify token hasn't expired
- Check RLS policies in Supabase

**Profile not loading:**
- Verify user has record in `public.users` table
- Check student/parent profile exists
- Review console logs for errors

---

**Documentation Generated:** 2025-11-29  
**Auth System Version:** 1.0.0  
**Status:** Phase 1 MVP Complete ✅
