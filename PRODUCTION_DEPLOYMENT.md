# Production Deployment Guide - File Storage on Render

## Overview

Your application now supports **intelligent file storage** that automatically selects the best option for your environment:

- **Local Development**: Files stored locally in `/uploads`
- **Render (Production)**: Automatically uses S3 if configured, otherwise falls back to local storage
- **Self-Hosted**: Local persistent storage

## Quick Start for Render

### Option 1: Use Local Storage (Simple, Files Lost on Restart)

No additional configuration needed. Files will work but be deleted when the server restarts.

**⚠️ Limitations:**
- Files disappear after server restart
- Not suitable for production if file persistence is important
- Acceptable for testing/demo

### Option 2: Use AWS S3 (Recommended for Production)

#### Step 1: Create AWS S3 Bucket

1. Go to [AWS Console](https://console.aws.amazon.com/) → S3
2. Create a new bucket (e.g., `shnoor-files`)
3. Note the bucket name
4. In bucket settings, add CORS configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedOrigins": ["https://shnoor.vercel.app"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

#### Step 2: Create IAM User with S3 Permissions

1. Go to AWS Console → IAM → Users → Create User
2. Set username: `shnoor-app`
3. Skip tags, click Create User
4. Go to the new user → Security Credentials
5. Create an Access Key:
   - Copy **Access Key ID**
   - Copy **Secret Access Key** (save it, you won't see it again!)
6. Go to Permissions → Add inline policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::shnoor-files",
           "arn:aws:s3:::shnoor-files/*"
         ]
       }
     ]
   }
   ```

#### Step 3: Add AWS Credentials to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service
3. Go to **Environment** tab
4. Add new environment variables:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET_NAME=shnoor-files
   AWS_REGION=us-east-1
   NODE_ENV=production
   ```
5. Click **Save**

#### Step 4: Install aws-sdk Dependency

1. In your backend repository, install AWS SDK:
   ```bash
   npm install aws-sdk
   ```
2. Commit and push:
   ```bash
   git add package.json package-lock.json
   git commit -m "deps: add aws-sdk for S3 storage"
   git push origin main
   ```

#### Step 5: Verify Deployment

After Render redeploys:

1. Check backend logs to see storage configuration:
   ```
   📁 Storage Configuration:
     - Environment: PRODUCTION
     - Platform: Render (ephemeral)
     - S3 Available: YES
     - S3 Configured: YES
     ✅ Using S3 for persistent storage
   ```

2. Test file upload on https://shnoor.vercel.app
3. Upload a file and verify it appears
4. Stop/restart the backend service and verify file still exists

## Environment-Based Behavior

### Development (Node.js / Local)
```
NODE_ENV=development
↓
Uses local storage (/uploads)
Files persist as long as server runs
```

### Production on Render (No S3 Configured)
```
NODE_ENV=production + RENDER=true + No AWS credentials
↓
⚠️ WARNING: Uses local storage (ephemeral)
Files lost on server restart
```

### Production on Render (S3 Configured)
```
NODE_ENV=production + RENDER=true + AWS credentials
↓
✅ Uses S3
Files persist permanently
```

### Production (Self-Hosted with Persistent Volume)
```
NODE_ENV=production + Not on RENDER
↓
Uses local storage (/uploads)
Files persist (with proper volume configuration)
```

## AWS S3 Cost Estimation

| Usage | Est. Monthly Cost |
|-------|------------------|
| 100 files (2MB avg) | ~$0.04 |
| 1,000 files (2MB avg) | ~$0.46 |
| 10,000 files (2MB avg) | ~$4.60 |

**Pricing Breakdown:**
- Storage: $0.023/GB
- GET requests: Free (20,000/month included)
- PUT requests: $0.0005 per 1,000 requests

For more: https://aws.amazon.com/s3/pricing/

## Troubleshooting

### "S3 upload failed" but files still upload

The system automatically falls back to local storage. Files are stored locally but will be lost on restart.

**Solution:** Configure S3 credentials properly in Render environment variables.

### "ENOENT: no such file or directory, mkdir" Error

The `/uploads` directory can't be created on Render.

**Solution:** This shouldn't happen, but if it does, ensure the backend has proper permissions and use S3.

### Files disappear after server restart

Expected behavior if using local storage on Render.

**Solution:** Set up AWS S3 using the guide above.

### "AWS_S3_BUCKET_NAME not set" Error

S3 credentials are incomplete.

**Solution:** Add all 4 AWS environment variables to Render:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_S3_BUCKET_NAME
- AWS_REGION

### 403 Forbidden when downloading files

S3 bucket permissions issue.

**Solution:**
1. Verify S3 ACL is set to `public-read`
2. Check CORS configuration matches your frontend domain
3. Verify IAM policy allows `s3:GetObject`

## Monitoring

### Check Current Storage Configuration

On Render, check backend logs on startup. You should see:
```
📁 Storage Configuration:
  - Environment: PRODUCTION
  - Platform: Render (ephemeral)
  - S3 Available: YES
  - S3 Configured: YES
  ✅ Using S3 for persistent storage
```

### AWS S3 CloudWatch

Monitor S3 usage in AWS Console:
1. CloudWatch → Dashboards → Create Dashboard
2. Add S3 metrics: Bucket Size, Object Count
3. Monitor costs in Billing Dashboard

## Switching Storage Options

### From Local to S3
1. Add AWS credentials to Render environment
2. Server will automatically detect and use S3 on next request
3. Old local files are not migrated (start fresh)

### From S3 to Local
1. Remove AWS credentials from Render environment
2. Server will fall back to local storage
3. S3 files remain but won't be used

### Migrating S3 Files to Local (or vice versa)
Currently not automated. You can:
1. Download files from S3: `aws s3 sync s3://bucket-name ./uploads`
2. Upload to S3: `aws s3 sync ./uploads s3://bucket-name`
3. Or use AWS CLI/Console tools

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/welcome.html)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Local Storage Setup](./LOCAL_STORAGE_SETUP.md)
- [S3 Setup Details](./S3_STORAGE_SETUP.md)

## Summary

✅ **Local Development**: Works out of the box, files in `/uploads`
✅ **Production on Render**: Use S3 for persistence (recommended)
✅ **Fallback**: Automatic fallback to local storage with warnings
✅ **Frontend**: No changes needed, same upload API

Your application is now production-ready with flexible storage options!
