# Fix EAS Build Permission Error

## Problem
You're getting this error:
```
Entity not authorized: AppEntity[dfc327da-2ff2-4ab9-8d6f-5bb53ab1e6bd]
You don't have the required permissions to perform this operation.
```

**Reason:** You're logged in as `soumiguria` but the project belongs to `guria29` account.

---

## Solution Options

### Option 1: Login as guria29 (If you have access)

If you have access to the `guria29` account:

```bash
# Logout current user
npx expo logout

# Login as guria29
npx expo login
# Enter guria29 credentials

# Verify
npx eas whoami
# Should show: guria29

# Now build
npx eas build --platform android --profile production
```

---

### Option 2: Create New Project (Recommended)

If you want to use `soumiguria` account, create a new project:

#### Step 1: Remove old projectId

Edit `app.json` and remove the projectId:

```json
"extra": {
  "googleMapsApiKey": "...",
  "eas": {
    // Remove this line:
    // "projectId": "dfc327da-2ff2-4ab9-8d6f-5bb53ab1e6bd"
  }
}
```

#### Step 2: Initialize new EAS project

```bash
npx eas init
```

This will:
- Create a new project under your current account (soumiguria)
- Generate a new projectId
- Update app.json automatically

#### Step 3: Build

```bash
npx eas build --platform android --profile production
```

---

## Quick Fix Script

Run the provided script:

```bash
fix-eas-permissions.bat
```

This will guide you through the process.

---

## Manual Steps (If script doesn't work)

### For Option 1 (Login as guria29):

1. **Logout:**
   ```bash
   npx expo logout
   ```

2. **Login as guria29:**
   ```bash
   npx expo login
   # Enter: guria29 credentials
   ```

3. **Verify:**
   ```bash
   npx eas whoami
   # Should show: guria29
   ```

4. **Build:**
   ```bash
   npx eas build --platform android --profile production
   ```

### For Option 2 (Create new project):

1. **Edit app.json:**
   - Open `app.json`
   - Find `"projectId": "dfc327da-2ff2-4ab9-8d6f-5bb53ab1e6bd"`
   - Remove that line (keep the `"eas": {}` object)

2. **Initialize new project:**
   ```bash
   npx eas init
   ```
   - Choose: "Create a new project"
   - Select your account: soumiguria
   - This will create a new projectId

3. **Build:**
   ```bash
   npx eas build --platform android --profile production
   ```

---

## After Fixing

Once you've fixed the permissions:

1. **Verify account:**
   ```bash
   npx eas whoami
   ```

2. **Check project:**
   ```bash
   npx eas project:info
   ```

3. **Build:**
   ```bash
   npx eas build --platform android --profile production
   ```

---

## Important Notes

- ⚠️ **Option 1** keeps the same projectId but requires access to guria29 account
- ✅ **Option 2** creates a fresh project under your current account
- 📝 If you choose Option 2, you'll need to reconfigure any EAS services (updates, credentials, etc.)

---

## Still Having Issues?

1. **Check EAS status:**
   ```bash
   npx eas project:info
   ```

2. **List your projects:**
   ```bash
   npx eas project:list
   ```

3. **Check account access:**
   - Go to https://expo.dev/accounts/
   - Verify which account owns the project

---

## Quick Command Reference

```bash
# Check current user
npx eas whoami

# Logout
npx expo logout

# Login
npx expo login

# Create new project
npx eas init

# Build
npx eas build --platform android --profile production
```

