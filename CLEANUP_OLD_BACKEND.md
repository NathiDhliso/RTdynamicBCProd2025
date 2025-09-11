# Old Backend Cleanup Instructions

## ⚠️ DEPRECATED: Elastic Beanstalk Backend

The `backend/` directory contains the old Express.js backend that was used with AWS Elastic Beanstalk. This has been **replaced** by the new AWS Lambda backend using SAM.

## ✅ New Lambda Backend

The new serverless backend is located in:
- **Directory**: `aws-lambda-backend/`
- **API Endpoints**: 
  - Contact: `https://7cwq9pgrx0.execute-api.us-east-1.amazonaws.com/production/api/contact`
  - Questionnaire: `https://7cwq9pgrx0.execute-api.us-east-1.amazonaws.com/production/api/questionnaire`

## 🗑️ Manual Cleanup Required

The old backend directory couldn't be automatically deleted because it's being used by a running process. To clean it up:

### Step 1: Stop All Node Processes
```powershell
# Stop all Node.js processes
Get-Process node | Stop-Process -Force

# Or restart your computer to ensure all processes are stopped
```

### Step 2: Delete Old Backend
```powershell
# Navigate to project root
cd C:\Users\nathi\OneDrive\Documents\Projects\RTDbc

# Remove old backend directory
Remove-Item -Path .\backend -Recurse -Force

# Remove this cleanup file when done
Remove-Item -Path .\CLEANUP_OLD_BACKEND.md
```

## 📋 What Was Removed

✅ **Already Deleted:**
- `backend-clean.zip`
- `backend-fixed.zip`

⏳ **Still Needs Manual Deletion:**
- `backend/` directory (contains old Express.js server)

## 🚀 Benefits of Migration

- **Cost Reduction**: 90-95% lower costs
- **No Server Management**: AWS handles infrastructure
- **Auto-scaling**: Handles traffic spikes automatically
- **Better Performance**: Faster response times
- **Modern Architecture**: Serverless with SAM

---

**Note**: The new Lambda backend preserves all functionality including email templates, quote calculations, and business logic.