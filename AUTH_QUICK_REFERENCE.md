# Authentication Quick Reference

## Frontend Usage

### 1. Setup Auth Provider

```typescript
// app/_layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <YourApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### 2. Use Auth Hook

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const {
    session,           // Supabase session
    profile,           // User profile data
    role,              // 'student' | 'parent' | 'admin'
    isLoading,         // Loading state
    isAuthenticated,   // Auth status
    signOut,           // Logout function
    refreshProfile     // Refresh profile data
  } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Login />;

  return <Dashboard />;
}
```

### 3. Auth Mutations

```typescript
// Student Signup
const signup = trpc.auth.signupStudent.useMutation();
await signup.mutateAsync({
  email: "student@example.com",
  password: "password123",
  fullName: "John Doe",
  grade: 10
});

// Parent Signup
const signup = trpc.auth.signupParent.useMutation();
await signup.mutateAsync({
  email: "parent@example.com",
  password: "password123",
  fullName: "Jane Doe"
});

// Login
const login = trpc.auth.login.useMutation();
await login.mutateAsync({
  email: "user@example.com",
  password: "password123"
});

// Logout
const { signOut } = useAuth();
signOut();

// Link Student (Parent only)
const link = trpc.auth.linkStudent.useMutation();
await link.mutateAsync({
  studentEmail: "student@example.com",
  relationship: "Father",
  isPrimary: true
});
```

### 4. Route Protection

```typescript
// Protect entire screen
function StudentDashboard() {
  const { role } = useAuth();
  
  if (role !== 'student') {
    return <Redirect href="/unauthorized" />;
  }
  
  return <Dashboard />;
}

// Conditional rendering
function Header() {
  const { role, profile } = useAuth();
  
  return (
    <View>
      {role === 'student' && (
        <Text>Points: {profile.totalPoints}</Text>
      )}
      {role === 'parent' && (
        <Text>Students: {profile.linkedStudents.length}</Text>
      )}
    </View>
  );
}
```

---

## Backend Usage

### 1. Create Protected Route

```typescript
import { protectedProcedure } from '../../create-context';

export const myRoute = protectedProcedure
  .query(async ({ ctx }) => {
    // ctx.userId, ctx.userEmail, ctx.userRole available
    return { userId: ctx.userId };
  });
```

### 2. Create Role-Specific Route

```typescript
// Student only
import { studentProcedure } from '../../create-context';

export const getMyProgress = studentProcedure
  .query(async ({ ctx }) => {
    // ctx.userRole === 'student' guaranteed
    const progress = await ctx.supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', ctx.userId)
      .single();
    
    return progress;
  });

// Parent only
import { parentProcedure } from '../../create-context';

export const getLinkedStudents = parentProcedure
  .query(async ({ ctx }) => {
    // ctx.userRole === 'parent' guaranteed
    const students = await ctx.supabase
      .from('student_parent_links')
      .select('*, student_profiles(*)')
      .eq('parent_id', ctx.userId);
    
    return students;
  });
```

### 3. Add to Router

```typescript
// backend/trpc/app-router.ts
import myRoute from './routes/my-feature/route';

export const appRouter = createTRPCRouter({
  auth: { /* ... */ },
  myFeature: createTRPCRouter({
    myRoute: myRoute,
  }),
});
```

---

## Common Patterns

### Check Auth Status

```typescript
const { isAuthenticated, isLoading } = useAuth();

if (isLoading) {
  return <SplashScreen />;
}

if (!isAuthenticated) {
  return <Redirect href="/login" />;
}
```

### Access User Data

```typescript
const { profile, role } = useAuth();

if (role === 'student') {
  console.log('Grade:', profile.grade);
  console.log('Points:', profile.totalPoints);
}

if (role === 'parent') {
  console.log('Linked Students:', profile.linkedStudents);
}
```

### Handle Auth Errors

```typescript
const login = trpc.auth.login.useMutation({
  onSuccess: (data) => {
    if (data.user.role === 'student') {
      router.push('/dashboard');
    } else {
      router.push('/parent');
    }
  },
  onError: (error) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      Alert.alert('Error', 'Invalid email or password');
    } else {
      Alert.alert('Error', error.message);
    }
  }
});
```

### Refresh Profile Data

```typescript
const { refreshProfile } = useAuth();

// After updating profile
await updateProfile.mutateAsync({ fullName: 'New Name' });
refreshProfile(); // Reload profile from database
```

---

## Type Reference

```typescript
// User Roles
type UserRole = 'student' | 'parent' | 'admin';

// Student Profile
interface StudentProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  grade: number;
  board: string;
  schoolName?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  currentStreak: number;
  totalPoints: number;
  level: number;
}

// Parent Profile
interface ParentProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  linkedStudents: {
    id: string;
    fullName: string;
    grade: number;
    relationship?: string;
    isPrimary: boolean;
  }[];
}
```

---

## File Locations

**Backend:**
- `backend/types/auth.ts` - Type definitions
- `backend/trpc/create-context.ts` - Middleware & procedures
- `backend/trpc/routes/auth/*` - Auth endpoints
- `backend/trpc/app-router.ts` - Router configuration

**Frontend:**
- `contexts/AuthContext.tsx` - Auth provider & hook
- `lib/trpc.ts` - tRPC client with auth headers
- `lib/supabase.ts` - Supabase client

**Documentation:**
- `AUTHENTICATION.md` - Complete documentation
- `AUTH_QUICK_REFERENCE.md` - This file

---

## Environment Variables

Required in `.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_RORK_API_BASE_URL=your-api-url
```

---

## Common Issues

**Problem:** Session not persisting  
**Solution:** Check `persistSession: true` in Supabase client config

**Problem:** UNAUTHORIZED error  
**Solution:** Verify JWT token in headers, check token expiry

**Problem:** Profile not loading  
**Solution:** Ensure user record exists in `public.users` and profile table

**Problem:** Role check failing  
**Solution:** Verify `role` field in `public.users` table

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** 2025-11-29
