import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

function shouldServeInline(contentType: string): boolean {
  return (contentType.startsWith('image/') && contentType !== 'image/svg+xml')
    || contentType.startsWith('video/')
    || contentType.startsWith('audio/');
}

const s3 = createS3Client();

export async function generatePresignedUploadUrl(fileName: string, contentType: string, isPublic = false) {
  const { bucketName } = getBucketConfig();
  const prefix = isPublic ? 'public/uploads' : 'uploads';
  const cloud_storage_path = `${prefix}/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return { uploadUrl, cloud_storage_path };
}

export async function getFileUrl(cloud_storage_path: string, contentType: string, isPublic: boolean) {
  const { bucketName } = getBucketConfig();
  if (isPublic) {
    if (process.env.SUPABASE_URL) {
      const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
      const objectPath = cloud_storage_path.split('/').map(encodeURIComponent).join('/');
      return `${baseUrl}/storage/v1/object/public/${bucketName}/${objectPath}`;
    }
    const region = process.env.AWS_REGION ?? 'us-west-2';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path.split('/').map(encodeURIComponent).join('/')}`;
  }
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ResponseContentDisposition: shouldServeInline(contentType) ? 'inline' : 'attachment',
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function deleteFile(cloud_storage_path: string) {
  const { bucketName } = getBucketConfig();
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
  });
  await s3.send(command);
}

export async function initiateMultipartUpload(fileName: string, contentType: string, isPublic: boolean) {
  const { bucketName } = getBucketConfig();
  const prefix = isPublic ? 'public/uploads' : 'uploads';
  const cloud_storage_path = `${prefix}/${Date.now()}-${fileName}`;
  const command = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentType: contentType,
  });
  const response = await s3.send(command);
  return { uploadId: response.UploadId ?? '', cloud_storage_path };
}

export async function getPresignedUrlForPart(cloud_storage_path: string, uploadId: string, partNumber: number) {
  const { bucketName } = getBucketConfig();
  const command = new UploadPartCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function completeMultipartUpload(cloud_storage_path: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) {
  const { bucketName } = getBucketConfig();
  const command = new CompleteMultipartUploadCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });
  await s3.send(command);
}
