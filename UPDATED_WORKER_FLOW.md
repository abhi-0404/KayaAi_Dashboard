# 👷 Updated Worker Flow - Correct Implementation

## ✅ **Correct Understanding**

### **User Signup & Role Assignment:**

| User Type | Signs Up Via | Auto Role | Approval Needed? | Can Access |
|-----------|--------------|-----------|------------------|------------|
| **Worker** | Mobile App | `worker` | ✅ Yes (for mobile app) | Mobile app only |
| **Supervisor** | Website | `supervisor` | ✅ Yes (for website) | Website + Mobile app |
| **Admin** | Created by admin | `admin` | ✅ Yes (for website) | Website only |

---

## 🎯 **Key Changes Made**

### 1. **Worker Role is Now Read-Only**
- ✅ Workers who sign up via mobile app get `role = "worker"`
- ✅ In User Management, "Worker" is shown as **text only** (no dropdown)
- ✅ Admin **cannot** change worker to supervisor/admin via dropdown
- ✅ Only supervisors and admins have role dropdown

### 2. **Worker Approval Required**
- ✅ Workers **need approval** to use mobile app
- ✅ Access column shows "Pending approval" / "Approved" / "Blocked"
- ✅ Admin must approve before worker can login to mobile app
- ✅ NOT "N/A" anymore - workers need approval too!

### 3. **Action Menu Updated**
- ✅ Workers: "Approve Worker (Mobile App)" / "Block Worker (Mobile App)"
- ✅ Supervisors/Admins: "Approve User" / "Block User"
- ✅ Different messaging for clarity

---

## 📊 **Updated User Management UI**

### **Worker Row:**
```
┌──────────────────────────────────────────────────────┐
│ 👤 John Doe (Worker)                                  │
│    worker@app.com                                     │
│                                                       │
│ Role: 🔒 Worker (read-only, no dropdown)              │
│ Access: ⚠️ Pending approval (yellow)                  │
│ Actions: ⋮ → Approve Worker (Mobile App)              │
│              Decline Worker                           │
└──────────────────────────────────────────────────────┘
```

### **Supervisor Row:**
```
┌──────────────────────────────────────────────────────┐
│ 👤 Jane Smith                                         │
│    supervisor@app.com                                 │
│                                                       │
│ Role: Supervisor ▼ (dropdown: Admin/Supervisor)       │
│ Access: ⚠️ Pending approval                           │
│ Actions: ⋮ → Approve User                             │
│              Decline Request                          │
└──────────────────────────────────────────────────────┘
```

### **Admin Row:**
```
┌──────────────────────────────────────────────────────┐
│ 👤 Mike Admin                                         │
│    admin@app.com                                      │
│                                                       │
│ Role: Admin ▼ (dropdown: Admin/Supervisor)            │
│ Access: ✅ Approved                                   │
│ Actions: ⋮ → Block User                               │
└──────────────────────────────────────────────────────┘
```

---

## 🎬 **Complete User Flows**

### **Flow 1: Worker Signs Up (Mobile App)**

```
1. Worker opens mobile app
2. Worker signs up with email/password
3. Backend creates account:
   - role = "worker" (automatic)
   - approval_status = "pending"
4. Worker tries to login → "Account pending approval" ❌
5. Admin sees worker in User Management:
   - Role: Worker (read-only text)
   - Access: Pending approval (yellow)
6. Admin clicks ⋮ → "Approve Worker (Mobile App)"
7. Worker's approval_status → "approved" ✅
8. Worker can now login to mobile app ✅
```

### **Flow 2: Supervisor Signs Up (Website)**

```
1. Supervisor visits website
2. Supervisor signs up
3. Backend creates account:
   - role = "supervisor" (automatic)
   - approval_status = "pending"
4. Supervisor sees "Pending Approval" screen ❌
5. Admin sees supervisor in User Management:
   - Role: Supervisor ▼ (can change to Admin)
   - Access: Pending approval
6. Admin clicks ⋮ → "Approve User"
7. Supervisor's approval_status → "approved" ✅
8. Supervisor can now access website ✅
9. Supervisor can also use mobile app ✅
```

### **Flow 3: Admin Blocks Worker**

```
1. Worker is using mobile app
2. Admin goes to User Management
3. Admin finds worker → Clicks ⋮
4. Admin clicks "Block Worker (Mobile App)"
5. Worker's approval_status → "rejected"
6. Mobile app checks status (via Realtime or on next action)
7. Worker gets logged out / blocked message ❌
8. Worker cannot login until unblocked
```

### **Flow 4: Admin Promotes Supervisor to Admin**

```
1. Admin opens User Management
2. Admin finds supervisor
3. Admin changes dropdown: Supervisor → Admin
4. Supervisor is now Admin ✅
5. Supervisor has admin privileges on website
6. (Still approved, no re-approval needed)
```

---

## 🔧 **What Changed in Code**

### **File: `src/routes/_authenticated/users.tsx`**

#### **1. Role Column - Workers Show Read-Only Text:**
```typescript
{u.role === "worker" ? (
  // Workers: No dropdown, just text
  <div className="inline-flex items-center gap-2">
    <UserCog className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm font-medium text-muted-foreground">Worker</span>
  </div>
) : (
  // Supervisors/Admins: Dropdown between Admin/Supervisor
  <select value={u.role}>
    <option value="admin">Admin</option>
    <option value="supervisor">Supervisor</option>
  </select>
)}
```

#### **2. Access Column - Workers Show Approval Status:**
```typescript
{u.role === "worker" ? (
  // Workers: Show approval status (for mobile app)
  <StatusChip level={statusLevel}>
    {approval_status}
  </StatusChip>
) : (
  // Same for supervisors/admins (for website)
  <StatusChip level={statusLevel}>
    {approval_status}
  </StatusChip>
)}
```

#### **3. Actions Menu - Different Options for Workers:**
```typescript
{u.role === "worker" ? (
  <>
    <button>Approve Worker (Mobile App)</button>
    <button>Block Worker (Mobile App)</button>
    <button>Decline Worker</button>
  </>
) : (
  <>
    <button>Approve User</button>
    <button>Block User</button>
    <button>Decline Request</button>
  </>
)}
```

---

## 📱 **Mobile App Integration**

### **On Worker Signup:**

```typescript
// Mobile app handles signup
const { data: authData, error } = await supabase.auth.signUp({
  email: email,
  password: password,
});

if (authData.user) {
  // Auto-assign worker role
  await supabase.from('user_roles').insert({
    user_id: authData.user.id,
    role: 'worker'
  });
  
  // Set approval status to pending
  await supabase.from('profiles').update({
    approval_status: 'pending'
  }).eq('id', authData.user.id);
}

// Show message: "Account created! Please wait for admin approval."
```

### **On Worker Login:**

```typescript
// Mobile app checks approval status
const { data: session } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});

if (session) {
  // Check approval status
  const { data: profile } = await supabase
    .from('profiles')
    .select('approval_status, role')
    .eq('id', session.user.id)
    .single();
  
  if (profile.approval_status === 'pending') {
    // Show: "Your account is pending approval. Please wait."
    await supabase.auth.signOut();
    return;
  }
  
  if (profile.approval_status === 'rejected') {
    // Show: "Your account has been blocked. Contact admin."
    await supabase.auth.signOut();
    return;
  }
  
  // Profile is approved! Allow access ✅
  navigateToHome();
}
```

### **Realtime Blocking (Optional but Recommended):**

```typescript
// Listen for approval status changes
supabase
  .channel(`profile_${userId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    table: 'profiles',
    filter: `id=eq.${userId}`
  }, (payload) => {
    if (payload.new.approval_status === 'rejected') {
      // Admin just blocked this worker!
      showAlert('Your account has been blocked by an administrator.');
      supabase.auth.signOut();
      navigateToLogin();
    }
    if (payload.new.approval_status === 'approved') {
      // Admin just approved this worker!
      showAlert('Your account has been approved! You can now use the app.');
      reloadApp();
    }
  })
  .subscribe();
```

---

## 🧪 **Testing Checklist**

### **Worker Tests:**
- [ ] Worker signs up via mobile app → Role auto-set to "worker"
- [ ] Worker tries to login → "Pending approval" message
- [ ] Admin sees worker in User Management
- [ ] Worker role shows as text (no dropdown) ✅
- [ ] Access shows "Pending approval" (not "N/A")
- [ ] Admin clicks "Approve Worker (Mobile App)"
- [ ] Worker can now login to mobile app ✅
- [ ] Admin clicks "Block Worker"
- [ ] Worker gets blocked from mobile app ✅

### **Supervisor Tests:**
- [ ] Supervisor signs up via website
- [ ] Sees "Pending Approval" screen
- [ ] Admin approves via User Management
- [ ] Supervisor can access website immediately ✅
- [ ] Supervisor role has dropdown (Admin/Supervisor) ✅
- [ ] Admin can change role to Admin ✅

### **Role Dropdown Tests:**
- [ ] Worker row: No dropdown, just "Worker" text ✅
- [ ] Supervisor row: Dropdown shows Admin/Supervisor ✅
- [ ] Admin row: Dropdown shows Admin/Supervisor ✅
- [ ] Changing supervisor → admin works ✅
- [ ] Changing admin → supervisor works ✅

---

## 💬 **Updated Toast Messages**

```typescript
// Worker approved
✅ "John Doe worker account has been approved (mobile app access granted)"

// Worker blocked
✅ "John Doe worker has been blocked (mobile app access revoked)"

// Supervisor approved
✅ "Jane Smith has been approved (website access granted)"

// Supervisor blocked
✅ "Jane Smith has been blocked (website access revoked)"
```

---

## 📋 **Summary of Changes**

| Change | Before | After |
|--------|--------|-------|
| Worker role | Dropdown with Worker option | Read-only text "Worker" ✅ |
| Worker access | "N/A" | "Pending/Approved/Blocked" ✅ |
| Worker approval | Not needed | Required for mobile app ✅ |
| Admin/Supervisor dropdown | 3 options (Admin/Supervisor/Worker) | 2 options (Admin/Supervisor) ✅ |
| Action menu for workers | Generic options | Specific "Mobile App" messaging ✅ |

---

## ✅ **Final Implementation**

**Workers:**
- Sign up via mobile app → Auto role = "worker"
- Need admin approval to use mobile app
- Role shown as text only (no dropdown)
- Can be approved/blocked by admin

**Supervisors/Admins:**
- Sign up via website → Auto role = "supervisor" or "admin"
- Need admin approval to use website
- Role can be changed between Admin/Supervisor
- Can be approved/blocked by admin

**Perfect for your use case!** 🎉
