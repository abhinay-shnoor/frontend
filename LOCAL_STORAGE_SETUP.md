# Local File Storage Implementation Guide

## What Has Changed

I've implemented **local file storage** as an alternative to Cloudinary for your chat application. Files are now stored on your server's disk instead of using Cloudinary's cloud storage.

### Modified Files

1. **`backend/src/config/localStorage.js`** (NEW)
   - Handles file storage and retrieval using the local `uploads/` directory
   - Automatically creates the uploads directory if it doesn't exist
   - Provides utilities for saving and deleting files

2. **`backend/src/controllers/messages.controller.js`**
   - Changed to use local file storage for message attachments
   - File upload now saves to disk instead of Cloudinary

3. **`backend/src/controllers/users.controller.js`**
   - Changed to use local file storage for user avatars
   - Avatars are now stored locally instead of Cloudinary

## Key Features

✅ **No Cloudinary Dependency** - Files stored locally on your server  
✅ **Automatic Directory Creation** - Creates `uploads/` directory automatically  
✅ **Secure File Paths** - Prevents directory traversal attacks  
✅ **Dynamic Base URLs** - Works on localhost, staging, and production  
✅ **File Deletion Support** - Ability to remove files when needed  
✅ **Same API Response** - Frontend code works unchanged  

## Setup Instructions

### 1. Install Required Dependencies
If not already installed, ensure you have the necessary packages:
```bash
npm install multer express
```

### 2. Create Uploads Directory
The directory will be created automatically when the server starts. Ensure your server has **write permissions** in the backend directory.

For Render or production servers:
- The server process must have write permissions to create and store files
- Files persist as long as your server is running
- **Note**: If using Render's free tier, files are lost on server restart (see Migration section below)

### 3. Environment Variables (Optional)
You **no longer need** Cloudinary environment variables:
- ❌ `CLOUDINARY_CLOUD_NAME`
- ❌ `CLOUDINARY_API_KEY`
- ❌ `CLOUDINARY_API_SECRET`

You can remove these from your `.env` file.

### 4. Test the Implementation

**Test Avatar Upload:**
```bash
curl -X POST http://localhost:5000/api/users/me/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

**Test File Upload:**
```bash
curl -X POST http://localhost:5000/api/messages/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf"
```

## File Size Limits

- **Avatar uploads**: 5 MB
- **Message attachments**: 10 MB

These are configured in `localStorage.js` and can be adjusted by modifying the multer limits.

## Production Considerations

### For Render (Current Platform)

⚠️ **Important**: Render's ephemeral file system means files are **deleted on server restart**.

**Solutions:**

1. **Use AWS S3 (Recommended)**
   ```bash
   npm install aws-sdk
   ```
   Replace localStorage.js with S3 integration

2. **Use Another Cloud Service**
   - Google Cloud Storage
   - Azure Blob Storage
   - DigitalOcean Spaces

3. **Use Persistent Volumes**
   - Upgrade to Render's paid plan with persistent disks

### For Self-Hosted Servers

If you're hosting on your own server with persistent storage:
- ✅ Local storage works great
- Ensure automatic backups of the `uploads/` directory
- Monitor disk space usage

## Reverting to Cloudinary (If Needed)

If you need to switch back to Cloudinary:

1. Revert the changes in `messages.controller.js` and `users.controller.js`
2. Restore the original multer memory storage configuration
3. Re-add Cloudinary environment variables
4. Run `git checkout backend/src/controllers/` to restore original files

## File Structure

```
backend/
├── uploads/                    # Files stored here
│   ├── 1776999999-avatar.jpg
│   ├── 1776999998-document.pdf
│   └── ...
├── src/
│   ├── config/
│   │   ├── localStorage.js     # Local storage utilities (NEW)
│   │   └── cloudinary.js       # No longer used
│   ├── controllers/
│   │   ├── messages.controller.js    # Updated
│   │   └── users.controller.js       # Updated
│   └── index.js                # Already configured to serve /uploads
```

## API Response Format

Upload endpoints still return the same format:

```json
{
  "url": "http://your-server.com/uploads/1776999999-filename.pdf",
  "name": "filename.pdf",
  "type": "application/pdf",
  "size": 524288,
  "filename": "1776999999-filename.pdf"
}
```

## Troubleshooting

### "EACCES: permission denied" Error
- Server doesn't have write permissions
- On Linux/Mac: Run `chmod 755 backend/` or ensure proper directory ownership
- On Render: Verify the process can write to /home/rnoder/app/backend

### Files Not Found (404)
- Check that `/uploads` route is configured in `index.js` ✓ (Already set up)
- Verify the file was saved: Check the `uploads/` directory
- Ensure the correct base URL is being used

### Upload Fails with Large Files
- Increase limits in `localStorage.js`:
  ```javascript
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
  ```

## Frontend - No Changes Needed!

The upload API response is identical, so your frontend code works without modifications. The `MessageInput.jsx` and `ProfileSettingsModal.jsx` components will continue to work as-is.

---

**Need help with S3 or persistent storage?** Let me know and I can provide implementation for those as well.
