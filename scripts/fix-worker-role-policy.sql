-- =====================================================
-- Fix RLS Policy for Worker Role
-- =====================================================
-- This fixes the "violates row-level security policy" error
-- when trying to assign "worker" role to users.
-- =====================================================

-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gjlblcrmqkbxlrqxffaz/sql/new

-- =====================================================
-- Step 1: Check existing policies
-- =====================================================

-- View current policies on user_roles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_roles';

-- =====================================================
-- Step 2: Drop old restrictive policies (if they exist)
-- =====================================================

-- These policies might be blocking the "worker" role
DROP POLICY IF EXISTS "user_roles_insert_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;

-- =====================================================
-- Step 3: Create new policies that allow all 3 roles
-- =====================================================

-- Allow admins to insert any role (admin, supervisor, worker)
CREATE POLICY "Admins can insert any role"
ON user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only admins can insert roles
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  -- Allow admin, supervisor, OR worker roles
  AND role IN ('admin', 'supervisor', 'worker')
);

-- Allow admins to update any role (admin, supervisor, worker)
CREATE POLICY "Admins can update any role"
ON user_roles
FOR UPDATE
TO authenticated
USING (
  -- Only admins can update roles
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  -- Allow admin, supervisor, OR worker roles
  role IN ('admin', 'supervisor', 'worker')
);

-- Allow admins to delete roles
CREATE POLICY "Admins can delete roles"
ON user_roles
FOR DELETE
TO authenticated
USING (
  -- Only admins can delete roles
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- Step 4: Verify policies are working
-- =====================================================

-- Check the new policies
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- =====================================================
-- Step 5: Test with a sample user (optional)
-- =====================================================

-- Uncomment to test assigning worker role:
-- UPDATE user_roles 
-- SET role = 'worker' 
-- WHERE user_id = 'SOME_USER_ID';

-- If no error appears, the fix worked! ✅

-- =====================================================
-- Alternative: Temporarily disable RLS (NOT RECOMMENDED)
-- =====================================================

-- Only use this if you're in development and need a quick fix
-- DO NOT use in production!

-- ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- ⚠️ Remember to re-enable it:
-- ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Success!
-- =====================================================
-- After running this SQL:
-- 1. Go back to User Management
-- 2. Try changing a user to "Worker"
-- 3. Should work without errors! ✅
-- =====================================================
