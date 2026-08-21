# 🔧 Quick Fix: Worker Role Error

## ❌ The Error

```
new row violates row-level security policy for table "user_roles"
```

This happens when trying to change a user's role to "Worker" in the User Management page.

---

## ✅ The Solution

The RLS (Row Level Security) policy on the `user_roles` table doesn't know about the "worker" role yet. We need to update it.

---

## 🚀 Quick Fix (2 minutes)

### Step 1: Go to Supabase SQL Editor

Open: https://supabase.com/dashboard/project/gjlblcrmqkbxlrqxffaz/sql/new

### Step 2: Run This SQL

**Option A: Simple Fix (Recommended for Development)**

```sql
-- Drop old policies
DROP POLICY IF EXISTS "user_roles_insert_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;

-- Create new policies that allow admin, supervisor, AND worker
CREATE POLICY "Admins can insert any role"
ON user_roles FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  AND role IN ('admin', 'supervisor', 'worker')
);

CREATE POLICY "Admins can update any role"
ON user_roles FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (role IN ('admin', 'supervisor', 'worker'));

CREATE POLICY "Admins can delete roles"
ON user_roles FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view roles"
ON user_roles FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
```

Click **RUN** ✅

### Step 3: Test

1. Go back to **User Management**
2. Change a user to **"Worker"**
3. Should work now! ✅

---

## 🆘 Alternative: Quick Development Fix

If you're in **development only** and need a super quick fix:

```sql
-- Temporarily disable RLS (DEVELOPMENT ONLY!)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning:** This removes all security from the `user_roles` table. Only use in development!

To re-enable:
```sql
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
```

---

## 🔍 What Caused This?

The `user_roles` table had an RLS policy that only allowed these values:
```sql
role IN ('admin', 'supervisor')
```

When we added "worker" role to the TypeScript code, the database didn't know about it yet.

The fix updates the policy to:
```sql
role IN ('admin', 'supervisor', 'worker')
```

---

## ✅ Verification

After running the SQL, verify it worked:

```sql
-- Check policies
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'user_roles';
```

You should see policies that include `'worker'` in the `WITH CHECK` clause.

---

## 📋 Testing Checklist

After applying the fix:

- [ ] Go to User Management page
- [ ] Select any user
- [ ] Change role to "Worker"
- [ ] Click outside or press Enter
- [ ] Should see: ✅ "User is now worker"
- [ ] No error should appear
- [ ] User's role shows as "Worker"
- [ ] Access column shows "N/A"

---

## 🎯 Summary

**Problem:** RLS policy blocked "worker" role
**Solution:** Updated policy to allow "worker"
**Fix time:** 2 minutes
**Status:** Ready to test!

Run the SQL above and try again! 🚀
