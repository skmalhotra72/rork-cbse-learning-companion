# Login Credentials for Testing

## Dummy User Accounts

Based on the `supabase-dummy-data.sql` file, here are the test accounts:

### STUDENT ACCOUNTS

**Student 1: Rahul Sharma (Grade 10)**
- Email: `student1@test.com`
- Password: `Test@123456`
- Stats: 850 points, Level 9, 7-day streak

**Student 2: Priya Patel (Grade 12)**
- Email: `student2@test.com`
- Password: `Test@123456`
- Stats: 1520 points, Level 16, 14-day streak

### PARENT ACCOUNTS

**Parent 1: Mr. Rajesh Sharma (Rahul's father)**
- Email: `parent1@test.com`
- Password: `Test@123456`
- Linked to: Rahul Sharma

**Parent 2: Mrs. Anjali Patel (Priya's mother)**
- Email: `parent2@test.com`
- Password: `Test@123456`
- Linked to: Priya Patel

---

## How to Use

1. Make sure you've run the `supabase-dummy-data.sql` script in your Supabase SQL editor
2. Start the backend: `bun run --watch backend/hono.ts`
3. Start the frontend: `npx expo start`
4. Use any of the above credentials to login

---

## Need Different Credentials?

If the above accounts don't work, you may need to:
1. Check if the dummy data was created properly in Supabase
2. Verify the user IDs match in both the `auth.users` table and the `public.users` table
3. See `supabase-dummy-data.sql` for instructions on creating new test users
