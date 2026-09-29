import { S3Client } from '@aws-sdk/client-s3';

export function getBucketConfig() {
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('SUPABASE_STORAGE_BUCKET is required');
  }

  return {
    bucketName,
  };
}

export function createS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION ?? 'us-east-1',
    endpoint: process.env.SUPABASE_S3_ENDPOINT,
    forcePathStyle: Boolean(process.env.SUPABASE_S3_ENDPOINT),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
  });
}
