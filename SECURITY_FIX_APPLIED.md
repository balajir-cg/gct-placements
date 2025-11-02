# 🔒 SECURITY FIX APPLIED - SMTP Credentials

## ✅ What Was Fixed

Your SMTP credentials (email and app password) were exposed in the tracked file `EMAIL_SYSTEM_COMPLETE.md`. This has been **sanitized and committed**.

### Files Cleaned:
- ✅ `EMAIL_SYSTEM_COMPLETE.md` - Credentials replaced with placeholders

### Files Already Protected:
- ✅ `.env.local` - Already in `.gitignore`, won't be committed
- ✅ `appwrite/.env` - Not tracked by git

---

## 🚨 CRITICAL: What You MUST Do Now

### 1. **REVOKE Your Gmail App Password Immediately**

Your current app password `euaxrujprnckzawv` may have been exposed if you pushed to GitHub. You MUST revoke it:

**Steps:**
1. Go to https://myaccount.google.com/apppasswords
2. Find the app password named "GCT Placement Portal" or similar
3. Click **Remove** or **Revoke**
4. Click **Done**

### 2. **Generate a NEW Gmail App Password**

1. Go to https://myaccount.google.com/apppasswords
2. Click **Select app** → Choose "Mail" or "Other (custom name)"
3. Enter name: "GCT Placement Portal V2"
4. Click **Generate**
5. Copy the new 16-character password (example: `abcd efgh ijkl mnop`)

### 3. **Update Your .env.local File**

Replace the old password with the new one:

```bash
# Open .env.local and update these lines:
SMTP_USER=balaji989412@gmail.com
SMTP_PASSWORD=your-new-app-password-here
SMTP_FROM_EMAIL=balaji989412@gmail.com
```

### 4. **Update Appwrite .env File**

```bash
# Edit appwrite/.env and update:
_APP_SMTP_USERNAME=balaji989412@gmail.com
_APP_SMTP_PASSWORD=your-new-app-password-here
```

### 5. **Restart Services**

```bash
# Restart Appwrite
cd appwrite
docker-compose restart

# Restart Next.js dev server (if running)
# Press Ctrl+C and run: pnpm dev
```

---

## 📋 Before Pushing to GitHub

### Check What Will Be Pushed:

```bash
# See commits that will be pushed
git log origin/notification..notification

# Search for any remaining credentials
git log -p | grep -i "euaxrujprnckzawv\|balaji989412@gmail"
```

### If Credentials Found in Git History:

If the old commits with credentials exist in git history, you have two options:

#### Option A: Rewrite History (If NOT pushed to GitHub yet)
```bash
# Interactive rebase to edit commits
git rebase -i HEAD~10  # Adjust number based on how far back

# Or use BFG Repo-Cleaner (recommended)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

#### Option B: If Already Pushed to GitHub
1. Delete the repository from GitHub
2. Create a new repository
3. Push cleaned code
4. Update team members

---

## 🛡️ Security Best Practices Going Forward

### 1. **Never Commit Credentials**
- ✅ Always use `.env.local` for secrets
- ✅ Use placeholders in documentation (e.g., `your-email@gmail.com`)
- ✅ Review files before committing: `git diff --cached`

### 2. **Use Environment Variables**
```bash
# Good ✅
SMTP_PASSWORD=${SMTP_PASSWORD}

# Bad ❌
SMTP_PASSWORD=euaxrujprnckzawv
```

### 3. **Pre-commit Hooks**
Install a pre-commit hook to catch secrets:

```bash
# Install git-secrets
npm install -g git-secrets

# Set up git-secrets
git secrets --install
git secrets --register-aws
git secrets --add 'password.*=.*'
git secrets --add '[A-Za-z0-9]{16}'  # App passwords
```

### 4. **Use .env.example Instead**
Create `env.example` with placeholders:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=GCT Placement Portal
```

### 5. **GitHub Secrets Scanner**
GitHub automatically scans for exposed secrets. If detected:
- You'll get a security alert
- Revoke credentials immediately
- Push a commit removing them

---

## ✅ Verification Checklist

- [ ] Old Gmail app password revoked
- [ ] New Gmail app password generated
- [ ] `.env.local` updated with new password
- [ ] `appwrite/.env` updated with new password
- [ ] Appwrite restarted
- [ ] No credentials in git log: `git log -p | grep -i password`
- [ ] `.gitignore` includes `.env*`
- [ ] Test email sending works with new password
- [ ] Safe to push to GitHub

---

## 🧪 Test Email After Fix

```bash
# Test the new credentials
node scripts/test-email-sending.js
```

Expected output:
```
✅ SMTP connection verified successfully!
✅ Test email sent successfully!
```

---

## 📞 If You Need Help

1. **Gmail App Password Issues**: https://support.google.com/accounts/answer/185833
2. **Git History Cleanup**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
3. **Appwrite Email Setup**: Check `SMTP_CONFIGURATION_GUIDE.md`

---

## 🎯 Summary

**Status**: ✅ Credentials removed from tracked files
**Next**: 🚨 REVOKE old app password and generate new one
**Safe to Push**: ⚠️ Only after checking git history is clean

**Your data is secure locally, but if you pushed to GitHub before this fix, the old credentials may still be in GitHub's history. Follow the steps above to secure your account.**

---

Last Updated: 2 November 2025
