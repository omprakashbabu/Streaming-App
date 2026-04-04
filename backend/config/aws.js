const AWS = require('aws-sdk');
require('dotenv').config();

// Update AWS config globally
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

// Configure AWS SDK with signature version 4
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

// Generate URL for S3 objects
const getSignedUrl = (s3Key) => {
  // Since bucket is now public, use direct public URL
  // S3 keys may have spaces, so encode them properly
  const encodedKey = s3Key.split('/').map(part => encodeURIComponent(part)).join('/');
  const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedKey}`;
  
  console.log('Generated URL for:', s3Key);
  console.log('URL:', publicUrl);
  
  return publicUrl;
  
  /* 
  // If you want to use signed URLs (for private buckets), use this instead:
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Expires: 3600,
  };
  return s3.getSignedUrl('getObject', params);
  */
};

// List objects in S3 bucket (optional - for future use)
const listS3Objects = async (prefix = '') => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: prefix,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents;
  } catch (error) {
    console.error('Error listing S3 objects:', error);
    throw error;
  }
};

module.exports = {
  s3,
  getSignedUrl,
  listS3Objects,
};