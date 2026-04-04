// // Test AWS S3 Connection
// // Run this with: node test-aws.js

// require('dotenv').config();
// const AWS = require('aws-sdk');

// console.log('🧪 Testing AWS S3 Connection...\n');

// // Check environment variables
// console.log('📋 Environment Variables:');
// console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set (starts with: ' + process.env.AWS_ACCESS_KEY_ID.substring(0, 4) + '...)' : '❌ Not set');
// console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set (length: ' + process.env.AWS_SECRET_ACCESS_KEY.length + ')' : '❌ Not set');
// console.log('AWS_REGION:', process.env.AWS_REGION || '❌ Not set');
// console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME || '❌ Not set');
// console.log('');

// // Update AWS config globally
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
//   signatureVersion: 'v4',
// });

// // Configure AWS
// // const s3 = new AWS.S3({
// //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
// //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// //   region: process.env.AWS_REGION,
// //   signatureVersion: 'v4',
// // });
// // console.log("SDK Region:", s3.config.region);

// const { S3Client } = require("@aws-sdk/client-s3");

// const s3 = new S3Client({
//   region: "ap-south-1", // FORCE IT
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
//   },
//   forcePathStyle: false,
// });




// // Test 1: List buckets
// console.log('🔍 Test 1: Listing all your S3 buckets...');
// s3.listBuckets((err, data) => {
//   if (err) {
//     console.log('❌ Error listing buckets:', err.message);
//     console.log('');
//     console.log('💡 Common issues:');
//     console.log('   - Access Key ID is incorrect');
//     console.log('   - Secret Access Key is incorrect');
//     console.log('   - IAM user lacks permissions');
//     return;
//   }
  
//   console.log('✅ Successfully connected to AWS!');
//   console.log('📦 Your buckets:');
//   data.Buckets.forEach(bucket => {
//     console.log('   -', bucket.Name);
//   });
//   console.log('');
  
//   // Test 2: List objects in specific bucket
//   const bucketName = process.env.S3_BUCKET_NAME;
//   console.log(`🔍 Test 2: Listing objects in bucket "${bucketName}"...`);
  
//   s3.listObjectsV2({ Bucket: bucketName }, (err, data) => {
//     if (err) {
//       console.log('❌ Error listing bucket contents:', err.message);
//       console.log('');
//       console.log('💡 Possible issues:');
//       console.log('   - Bucket name is incorrect');
//       console.log('   - Bucket is in different region');
//       console.log('   - IAM user lacks permissions for this bucket');
//       return;
//     }
    
//     console.log('✅ Successfully accessed bucket!');
//     console.log(`📁 Found ${data.Contents.length} objects:`);
    
//     if (data.Contents.length === 0) {
//       console.log('   (Bucket is empty)');
//     } else {
//       data.Contents.forEach(obj => {
//         console.log(`   - ${obj.Key} (${(obj.Size / 1024 / 1024).toFixed(2)} MB)`);
//       });
//     }
//     console.log('');
    
//     // Test 3: Generate signed URL
//     if (data.Contents.length > 0) {
//       const firstObject = data.Contents[0];
//       console.log('🔍 Test 3: Generating signed URL...');
      
//       try {
//         const signedUrl = s3.getSignedUrl('getObject', {
//           Bucket: bucketName,
//           Key: firstObject.Key,
//           Expires: 3600
//         });
        
//         console.log('✅ Signed URL generated successfully!');
//         console.log('🔗 URL (first 100 chars):', signedUrl.substring(0, 100) + '...');
//         console.log('');
//         console.log('✅ ALL TESTS PASSED! AWS S3 is working correctly!');
//         console.log('');
//         console.log('💡 Next steps:');
//         console.log('   1. Restart your Node.js server');
//         console.log('   2. Add videos in admin panel');
//         console.log('   3. Use S3 keys like: ' + firstObject.Key);

//       } catch (error) {
//         console.log('❌ Error generating signed URL:', error.message);
//       }
//     } else {
//       console.log('⚠️  No files found in bucket to test signed URL');
//       console.log('   Upload some video files to your S3 bucket first!');
//     }
//   });
// });




require("dotenv").config();

const { 
  S3Client, 
  ListObjectsV2Command 
} = require("@aws-sdk/client-s3");

console.log("🧪 Testing AWS S3 Connection...\n");

// Show env status
console.log("📋 Environment Variables:");
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "✅ Set" : "❌ Missing");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Missing");
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("S3_BUCKET_NAME:", process.env.S3_BUCKET_NAME);
console.log();

// Create S3 client (FORCED REGION)
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
  },
});

console.log("SDK Region:", s3.config.region, "\n");

// Main test
async function testS3() {
  try {
    console.log("🔍 Test: Listing files in bucket...\n");

    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      MaxKeys: 5,
    });

    const data = await s3.send(command);

    if (!data.Contents || data.Contents.length === 0) {
      console.log("⚠️ Bucket is empty.");
      return;
    }

    console.log("✅ Success! Files found:\n");

    data.Contents.forEach((file, i) => {
      console.log(`${i + 1}. ${file.Key} (${(file.Size / 1024).toFixed(2)} KB)`);
    });

  } catch (err) {
    console.error("❌ Error accessing S3:\n", err.message);
  }
}

testS3();
