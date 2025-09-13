# 📁 Supabase Storage Setup Guide

## Step 1: Create the Contracts Bucket

1. **Go to your Supabase Dashboard**
2. **Click "Storage"** in the left sidebar
3. **Click "New bucket"** button
4. **Fill in these exact values:**

### Bucket Configuration:
```
Name: contracts
```

```
Public: false
```

```
File size limit: 5242880
```

```
Allowed MIME types: application/pdf
```

5. **Click "Create bucket"**

---

## Step 2: Set Up Storage Policies

After creating the bucket, go to **Storage > Policies** and create these 3 policies:

### Policy 1: User Upload Policy

**Click "New Policy"** and fill in:

```
Policy name: Users can upload own contracts
```

```
Allowed operation: INSERT
```

```
Target roles: authenticated
```

**USING expression (copy exactly):**
```sql
bucket_id = 'contracts' AND (storage.foldername(name))[1] = auth.uid()::text AND auth.role() = 'authenticated'
```

**Click "Review" then "Save policy"**

---

### Policy 2: User Access Policy

**Click "New Policy"** and fill in:

```
Policy name: Users can view own contracts
```

```
Allowed operation: SELECT
```

```
Target roles: authenticated
```

**USING expression (copy exactly):**
```sql
bucket_id = 'contracts' AND (storage.foldername(name))[1] = auth.uid()::text AND auth.role() = 'authenticated'
```

**Click "Review" then "Save policy"**

---

### Policy 3: Admin Full Access Policy

**Click "New Policy"** and fill in:

```
Policy name: Admins can manage all contracts
```

```
Allowed operation: ALL
```

```
Target roles: authenticated
```

**USING expression (copy exactly):**
```sql
bucket_id = 'contracts' AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
```

**Click "Review" then "Save policy"**

---

## ✅ Verification

After completing all steps, you should see:

1. **In Storage > Buckets:**
   - ✅ `contracts` bucket (private)

2. **In Storage > Policies:**
   - ✅ `Users can upload own contracts` (INSERT)
   - ✅ `Users can view own contracts` (SELECT)  
   - ✅ `Admins can manage all contracts` (ALL)

## 🎯 Result

Once completed, the contract upload functionality in your app will work properly:
- Users can upload signed contracts during signup
- Users can download their own contracts from profile page
- Admins can access all contracts for management
- Files are organized by user ID for security

---

**Total setup time: ~3-5 minutes** ⏱️