# AWS S3 Storage Implementation (Optional)

If local storage doesn't meet your needs (especially for production on Render), use AWS S3.

## Setup Steps

### 1. Install AWS SDK
```bash
npm install aws-sdk
```

### 2. Add Environment Variables
Add these to your `.env` file:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

### 3. Create S3 Bucket
1. Go to AWS Console → S3
2. Create a new bucket (note the name)
3. Configure bucket for public read access
4. Create an IAM user with S3 permissions

### 4. Update Controllers

**For messages.controller.js:**
```javascript
const { uploadSingleFile, uploadToS3 } = require('../config/s3Storage');

exports.uploadAttachment = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file provided' });

  try {
    const fileData = await uploadToS3(req.file, 'attachments');
    res.json(fileData);
  } catch (err) {
    console.error('uploadAttachment error:', err);
    res.status(500).json({ message: 'File upload failed: ' + err.message });
  }
};
```

**For users.controller.js:**
```javascript
const { uploadSingleAvatar, uploadToS3 } = require('../config/s3Storage');

exports.uploadAvatarToCloud = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file provided' });
  try {
    const fileData = await uploadToS3(req.file, 'avatars');
    const dbResult = await pool.query(
      `UPDATE users SET avatar_url=$1 WHERE id=$2 RETURNING id,name,email,avatar_url,role`,
      [fileData.url, req.user.id]
    );
    res.json(dbResult.rows[0]);
  } catch (err) {
    console.error('uploadAvatarToCloud error:', err);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
};
```

## Cost Estimate
- Storage: ~$0.023 per GB/month
- Requests: Free tier includes 20,000 GET requests/month
- Great for small to medium apps

## Advantages Over Local Storage
✅ Persistent storage  
✅ Scalable  
✅ Cheap  
✅ Works on Render's ephemeral file system  
✅ CDN integration available
