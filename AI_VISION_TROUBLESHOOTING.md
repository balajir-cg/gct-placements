# AI Vision Service Troubleshooting Guide

## Issue: "No instances available" Error

### What Happened?
The free AI vision model (`qwen/qwen2.5-vl-32b-instruct:free`) is temporarily overloaded. This is common with free models during peak hours.

### What I Fixed:
1. ✅ **Added Retry Logic**: The API now automatically retries 3 times with exponential backoff
2. ✅ **Better Error Messages**: Users see helpful messages instead of technical errors
3. ✅ **Graceful Degradation**: Clear instructions on what to do when service is unavailable

---

## Solutions (Choose One)

### Option 1: Wait and Retry (Free)
The system now automatically retries 3 times. If it still fails:
- **Wait 1-2 minutes** and try uploading again
- Free models are usually available within a few minutes
- Peak hours: Avoid 9 AM - 5 PM EST

### Option 2: Use a Paid Model (Recommended for Production)

Edit `.env.local` and change the vision model:

```env
# Current (Free but unreliable)
VISION_MODEL=qwen/qwen2.5-vl-32b-instruct:free

# Option A: Google Gemini Flash (Fast & Cheap)
VISION_MODEL=google/gemini-flash-1.5-8b
# Cost: ~$0.001 per image
# Speed: Very fast
# Reliability: Excellent

# Option B: Claude Haiku (Best Accuracy)
VISION_MODEL=anthropic/claude-3-haiku
# Cost: ~$0.003 per image
# Speed: Fast
# Reliability: Excellent
# Accuracy: Best for complex marksheets

# Option C: GPT-4o Mini (Balanced)
VISION_MODEL=openai/gpt-4o-mini
# Cost: ~$0.002 per image
# Speed: Fast
# Reliability: Excellent
# Accuracy: Very good
```

**Cost Estimate:**
- 100 marksheet uploads/month ≈ $0.10 - $0.30
- Very affordable for production use

### Option 3: Fallback Configuration

You can configure multiple models as fallbacks in the future. For now, just change `VISION_MODEL` to a paid option.

---

## How the Retry System Works

```
Attempt 1: Immediate request
  ↓ (fails)
Wait 2 seconds
  ↓
Attempt 2: Retry with same model
  ↓ (fails)
Wait 4 seconds (exponential backoff)
  ↓
Attempt 3: Final retry
  ↓ (fails)
Show user-friendly error message
```

---

## Getting an OpenRouter API Key

If you don't have one yet:

1. Go to https://openrouter.ai
2. Sign up with GitHub/Google
3. Go to **Keys** section
4. Create a new API key
5. Add to `.env.local`:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

**Free Credits:**
- New users get $1 free credit
- Enough for ~1000 marksheet scans with free models
- Or ~500 scans with paid models

---

## Testing After Fix

```bash
# Start the dev server
pnpm dev

# Try uploading a marksheet
# You should see in the console:
# ✅ OpenRouter API attempt 1/3...
# ✅ OpenRouter API success on attempt 1
```

If it still fails after 3 retries, you'll see:
```
⚠️ The AI vision service is temporarily overloaded. 
Please wait 1-2 minutes and try again.
```

---

## Monitoring API Usage

Check your OpenRouter dashboard:
- https://openrouter.ai/activity
- See credit usage
- Monitor success/failure rates
- Switch models if needed

---

## Recommended Setup for Production

```env
# Use a reliable paid model
VISION_MODEL=google/gemini-flash-1.5-8b

# Keep the free model as backup in code comments
# VISION_MODEL=qwen/qwen2.5-vl-32b-instruct:free
```

**Why?**
- Free models: Great for development/testing
- Paid models: Required for reliable production use
- Very affordable ($0.10-0.30 per 100 scans)

---

## Error Messages Users Will See

### Before Fix:
```
Error: OpenRouter API error: {"error":{"message":"Provider returned error","code":503...
```

### After Fix:
```
⚠️ The AI vision service is temporarily overloaded. 
Please wait 1-2 minutes and try again. 
This happens with free AI models during peak hours.
```

Much better! 🎉

---

## Summary

✅ **Immediate Fix**: Retry logic added (3 attempts with exponential backoff)  
✅ **User-Friendly**: Clear error messages  
✅ **Cost-Effective**: Free model still works (just needs patience)  
💰 **Production Ready**: Switch to paid model for $0.10-0.30/100 scans  

**Current Status**: Ready to use! Try uploading a marksheet now.

---

Last Updated: November 2025
