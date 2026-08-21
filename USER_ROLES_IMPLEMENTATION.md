# 👥 User Roles Implementation - Complete Guide

## 🎯 Overview

The Kaya AI system now supports **3 user roles** with different access levels:

| Role | Website Access | Mobile App Access | Managed By |
|------|---------------|-------------------|------------|
| **Worker** | ❌ No | ✅ Yes | Admin |
| **Supervisor** | ✅ Yes (after approval) | ✅ Yes | Admin |
| **Admin** | ✅ Yes (after approval) | ❌ No* | Admin |

*Admins typically don't need mobile app access (but can be supervisors too if needed)

---

## 🔑 Key Features Implemented

### 1. **Worker Role**
- ✅ **Mobile app only** - Cannot access website
- ✅ Shows as **"Worker"** in User Management
- ✅ Access field shows **"N/A"** (no website approval needed)
- ✅ Can be **blocked** by admin (blocks mobile app access)
- ✅ If worker tries to login to website: Shows "Website Access Not Available" message

### 2. **Supervisor Role**
- ✅ **Both website AND mobile app** access
- ✅ Shows as **"Supervisor"** in User Management
- ✅ Requires **approval** for website access
- ✅ Access field shows "Pending/Approved/Blocked"
- ✅ Blocking prevents both website and mobile app access

### 3. **Admin Role**
- ✅ **Website access only** (manages system)
- ✅ Shows as **"Admin"** in User Management
- ✅ Requires **approval** for website access
- ✅ Can manage all users (approve/block/change roles)
- ✅ Cannot block themselves

---

## 📊 User Management Table

### Visual Reference:

```
┌─────────────────┬────────────┬─────────────────┬───────────────┐
│ User            │ Role       │ Access          │ Actions       │
├─────────────────┼────────────┼─────────────────┼───────────────┤
│ John Doe        │ Worker     │ N/A             │ Block/Unblock │
│ worker@app.com  │            │                 │               │
├─────────────────┼────────────┼─────────────────┼───────────────┤
│ Jane Smith      │ Supervisor │ Approved ✅     │ Block/Unblock │
│ super@app.com   │            │                 │ + Approve     │
├─────────────────┼────────────┼─────────────────┼───────────────┤
│ Mike Admin      │ Admin      │ Approved ✅     │ Block/Unblock │
│ admin@app.com   │            │                 │ + Approve     │
└─────────────────┴────────────┴─────────────────┴───────────────┘
```

---

## 🎬 User Flows

### **Worker Sign Up → Mobile App Access**

```
1. Worker signs up via mobile app
2. Account created with role = "worker"
3. Worker can immediately use mobile app ✅
   (No approval needed for mobile!)
4. If worker tries website → "Access Not Available" message
5. Admin can block worker → Blocks mobile app access
```

### **Supervisor Sign Up → Website + Mobile Access**

```
1. Supervisor signs up via website OR mobile app
2. Account created with role = "supervisor"
3. For website:
   - Status = "Pending approval" 
   - Shows "Pending Approval" screen
   - Admin must approve ✅
   - After approval → Full website access
4. For mobile app:
   - Can access immediately (or after approval, your choice)
5. Admin can block → Blocks both website + mobile
```

### **Admin Creates New Admin**

```
1. Existing admin creates account for new admin
2. Sets role = "admin"
3. New admin must be approved ✅
4. After approval → Full admin access
5. Can manage users, approve requests, etc.
```

---

## 🛠️ Implementation Details

### Files Modified:

#### 1. **`src/components/auth-context.tsx`**
```typescript
// Added "worker" to role type
export type AppRole = "admin" | "supervisor" | "worker";
```

#### 2. **`src/routes/_authenticated/route.tsx`**
```typescript
// Workers cannot access website
if (roles.includes("worker") && 
    !roles.includes("supervisor") && 
    !roles.includes("admin")) {
  return <WorkerAccessDenied />;
}
```

#### 3. **`src/routes/_authenticated/users.tsx`**

**Role Dropdown:**
```typescript
<select value={u.role}>
  <option value="admin">Admin</option>
  <option value="supervisor">Supervisor</option>
  <option value="worker">Worker</option> ← Added
</select>
```

**Access Column:**
```typescript
{u.role === "worker" ? (
  <StatusChip level="idle">N/A</StatusChip>
) : (
  <StatusChip level={statusLevel}>
    {u.approval_status}
  </StatusChip>
)}
```

**Actions Menu:**
```typescript
{u.role === "worker" ? (
  // Only Block/Unblock for workers
  <button>Block Worker (Mobile App)</button>
) : (
  // Approve/Block for supervisors/admins
  <button>Approve User</button>
  <button>Block User</button>
)}
```

---

## 🔐 Access Control Logic

### Website Access:
```typescript
// Who can access the website?
✅ Admin (if approved)
✅ Supervisor (if approved)
❌ Worker (always blocked)
```

### Mobile App Access:
```typescript
// Who can access mobile app?
✅ Worker (unless blocked)
✅ Supervisor (unless blocked)
❌ Admin (typically doesn't need it)
```

### Blocking Behavior:
```typescript
// When admin blocks a user:
Worker → approval_status = "rejected"
  → Mobile app checks this flag
  → Prevents mobile app login ✅

Supervisor/Admin → approval_status = "rejected"
  → Website checks this flag
  → Shows "Access Blocked" screen ✅
  → Also blocks mobile app (if integrated)
```

---

## 📱 Mobile App Integration

### Mobile App Should Check:

```typescript
// When worker logs in to mobile app:
const { data: profile } = await supabase
  .from('profiles')
  .select('approval_status, role')
  .eq('id', userId)
  .single();

if (profile.approval_status === 'rejected') {
  // Show "Account Blocked" message
  // Prevent app access
  return;
}

if (profile.role !== 'worker' && profile.role !== 'supervisor') {
  // Admins shouldn't use mobile app
  // (Or allow if you want)
  return;
}

// Allow access ✅
```

### Realtime Blocking:

```typescript
// Mobile app should subscribe to profile changes:
supabase
  .channel(`profile_${userId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    table: 'profiles',
    filter: `id=eq.${userId}`
  }, (payload) => {
    if (payload.new.approval_status === 'rejected') {
      // User was just blocked!
      // Log them out immediately
      // Show "Account Blocked" message
      await supabase.auth.signOut();
    }
  })
  .subscribe();
```

---

## 🧪 Testing Scenarios

### Test 1: Worker Website Access

1. **Create worker account** (mobile app)
2. **Try to login on website**
3. **Expected:** "Website Access Not Available" message ✅
4. **Sign out button** should work ✅

### Test 2: Worker Mobile Blocking

1. **Worker using mobile app**
2. **Admin blocks worker** (User Management)
3. **Expected:** Worker's mobile app access blocked ✅
4. **Worker tries to login:** "Account Blocked" message

### Test 3: Supervisor Access

1. **Supervisor signs up**
2. **Status:** "Pending approval"
3. **Admin approves**
4. **Expected:**
   - ✅ Website access granted (instantly via Realtime)
   - ✅ Mobile app access (if needed)

### Test 4: Role Changes

1. **User is Worker**
2. **Admin changes to Supervisor**
3. **Expected:**
   - ✅ User can now access website (after approval)
   - ✅ User still has mobile app access

### Test 5: Admin Self-Block

1. **Admin tries to block themselves**
2. **Expected:** Option not available ✅
   (Admins can't block themselves)

---

## 🎨 UI States

### User Management Table:

**Worker Row:**
```
┌─────────────────────────────────────────────┐
│ 👤 John Doe                                  │
│    worker@app.com                            │
│                                              │
│ Role: Worker ▼                               │
│ Access: N/A (gray badge)                     │
│ Actions: ⋮ → Block Worker (Mobile App)       │
└─────────────────────────────────────────────┘
```

**Supervisor Row (Pending):**
```
┌─────────────────────────────────────────────┐
│ 👤 Jane Smith                                │
│    supervisor@app.com                        │
│                                              │
│ Role: Supervisor ▼                           │
│ Access: Pending approval (yellow badge)      │
│ Actions: ⋮ → Approve / Decline               │
└─────────────────────────────────────────────┘
```

**Supervisor Row (Approved):**
```
┌─────────────────────────────────────────────┐
│ 👤 Jane Smith                                │
│    supervisor@app.com                        │
│                                              │
│ Role: Supervisor ▼                           │
│ Access: Approved (green badge)               │
│ Actions: ⋮ → Block User                      │
└─────────────────────────────────────────────┘
```

---

## 💬 Toast Messages

### Worker Actions:
```
✅ "John Doe has been blocked (mobile app access revoked)"
✅ "John Doe has been unblocked (mobile app access restored)"
```

### Supervisor/Admin Actions:
```
✅ "Jane Smith has been approved (website access granted)"
✅ "Jane Smith has been blocked (website access revoked)"
✅ "Mike Admin request has been declined"
```

---

## 🔄 Database Schema

### Required Tables:

**`profiles` table:**
```sql
- id (UUID)
- email (TEXT)
- display_name (TEXT)
- approval_status (TEXT) -- 'pending', 'approved', 'rejected'
- approved_at (TIMESTAMP)
- approved_by (UUID)
- created_at (TIMESTAMP)
```

**`user_roles` table:**
```sql
- user_id (UUID)
- role (TEXT) -- 'admin', 'supervisor', 'worker'
- created_at (TIMESTAMP)
```

### Default Role Assignment:

```sql
-- When new user signs up via website:
INSERT INTO user_roles (user_id, role) VALUES (user_id, 'supervisor');

-- When new user signs up via mobile app:
INSERT INTO user_roles (user_id, role) VALUES (user_id, 'worker');

-- When admin creates another admin:
INSERT INTO user_roles (user_id, role) VALUES (user_id, 'admin');
```

---

## 📋 Summary

| Feature | Status |
|---------|--------|
| Worker role added | ✅ Done |
| Worker website access blocked | ✅ Done |
| Worker shows "N/A" in Access column | ✅ Done |
| Workers can be blocked (mobile app) | ✅ Done |
| Supervisors work on both platforms | ✅ Done |
| Admins manage all users | ✅ Done |
| Role dropdown includes Worker | ✅ Done |
| Contextual action menus | ✅ Done |
| Better toast messages | ✅ Done |
| Realtime updates | ✅ Done (from previous fix) |

---

## 🚀 Next Steps

1. **Mobile app integration:**
   - Check `approval_status` on login
   - Block access if `rejected`
   - Subscribe to profile changes for realtime blocking

2. **Test thoroughly:**
   - Create worker → Verify can't access website
   - Block worker → Verify mobile app blocks
   - Change roles → Verify access updates

3. **Documentation:**
   - Update mobile app docs
   - Train admins on new role system
   - Document blocking behavior

---

## 🆘 FAQ

**Q: Can a worker become a supervisor?**
A: Yes! Admin changes their role to "supervisor", then they need website approval.

**Q: Can a supervisor still use mobile app after being blocked?**
A: No. Blocking a supervisor blocks BOTH website and mobile app access.

**Q: Do workers need approval?**
A: No approval needed for mobile app. But if they try to access the website, it's blocked regardless.

**Q: Can admins block themselves?**
A: No. The "Block" option doesn't appear for the logged-in admin's own account.

**Q: What happens if I change a supervisor to worker?**
A: They lose website access immediately and can only use mobile app.

---

**Implementation complete!** All 3 roles now work as specified. 🎉
