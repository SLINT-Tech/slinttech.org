# 📁 Supabase Storage Setup Guide

## ⚠️ Important: Disable Email Confirmation First

Before setting up storage, you need to disable email confirmation:

1. **Go to Authentication > Settings** in your Supabase dashboard
2. **Scroll down to "Email Confirmation"**
3. **Toggle OFF "Enable email confirmations"**
4. **Click "Save"**

This ensures users are immediately authenticated after signup, allowing storage uploads to work.

---

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
bucket_id = 'contracts' AND (string_to_array(name, '/'))[1] = auth.uid()::text
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
bucket_id = 'contracts' AND (string_to_array(name, '/'))[1] = auth.uid()::text
```

**Click "Review" then "Save policy"**

---

### Policy 3: User Update Policy

**Click "New Policy"** and fill in:

```
Policy name: Users can update own contracts
```

```
Allowed operation: UPDATE
```

```
Target roles: authenticated
```

**USING expression (copy exactly):**
```sql
bucket_id = 'contracts' AND (string_to_array(name, '/'))[1] = auth.uid()::text
```

**Click "Review" then "Save policy"**

---

### Policy 4: User Delete Policy

**Click "New Policy"** and fill in:

```
Policy name: Users can delete own contracts
```

```
Allowed operation: DELETE
```

```
Target roles: authenticated
```

**USING expression (copy exactly):**
```sql
bucket_id = 'contracts' AND (string_to_array(name, '/'))[1] = auth.uid()::text
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
   - ✅ `Users can update own contracts` (UPDATE)
   - ✅ `Users can delete own contracts` (DELETE)

## 🎯 Result

Once completed, the contract upload functionality in your app will work properly:
- Users can upload signed contracts during signup
- Users can download their own contracts from profile page
- Admins can access all contracts for management
- Files are organized by user ID for security

---

**Total setup time: ~3-5 minutes** ⏱️