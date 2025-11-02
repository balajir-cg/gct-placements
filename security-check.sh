#!/bin/bash
# Quick Security Check Script
# Run this before pushing to GitHub

echo "🔒 Security Check for GCT Placement Portal"
echo "=========================================="
echo ""

# Check for credentials in tracked files
echo "1. Checking for exposed credentials in tracked files..."
if git ls-files | xargs grep -l "euaxrujprnckzawv\|your-actual-password" 2>/dev/null; then
    echo "❌ CREDENTIALS FOUND! Do NOT push to GitHub!"
    exit 1
else
    echo "✅ No credentials found in tracked files"
fi

# Check if .env files are ignored
echo ""
echo "2. Checking .gitignore configuration..."
if grep -q "^\.env" .gitignore; then
    echo "✅ .env files are in .gitignore"
else
    echo "⚠️  WARNING: .env files not in .gitignore"
fi

# Check for .env.local in staging area
echo ""
echo "3. Checking staged files..."
if git diff --cached --name-only | grep -q "\.env"; then
    echo "❌ .env file is staged! Unstage it now:"
    echo "   git reset HEAD .env.local"
    exit 1
else
    echo "✅ No .env files staged"
fi

# Check for credentials in recent commits
echo ""
echo "4. Checking recent commits for passwords..."
if git log -10 -p | grep -q "password.*=.*[A-Za-z0-9]\{12,\}"; then
    echo "⚠️  WARNING: Possible password in recent commits"
    echo "   Review: git log -10 -p | grep -i password"
else
    echo "✅ No obvious passwords in recent commits"
fi

echo ""
echo "=========================================="
echo "✅ Security check complete!"
echo ""
echo "Before pushing:"
echo "  1. Ensure old Gmail app password is REVOKED"
echo "  2. New password set in .env.local"
echo "  3. Test emails work: node scripts/test-email-sending.js"
echo ""
echo "To push: git push origin notification"
