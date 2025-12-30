import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Credentials from user request
const S3_CONFIG = {
    endpoint: "https://tzuzzfoqqbrzshaajjqh.storage.supabase.co/storage/v1/s3",
    region: "ap-south-1",
    bucket: "OCR",
    credentials: {
        accessKeyId: "877ac66df56d64bba1d9861d3c92cb4f",
        secretAccessKey: "65acacb6c8d7a2bc260663174993b8a1cee0e4360b08a860c2435cc210fb4f00"
    }
};

const s3Client = new S3Client({
    region: S3_CONFIG.region,
    endpoint: S3_CONFIG.endpoint,
    credentials: S3_CONFIG.credentials,
    forcePathStyle: true // Needed for Supabase S3
});

export interface UploadResult {
    key: string;
    url: string;
}

export const uploadFileToS3 = async (file: File, path: string): Promise<UploadResult> => {
    try {
        // Convert File to Uint8Array to avoid stream compatibility issues in some browsers/environments
        const arrayBuffer = await file.arrayBuffer();
        const body = new Uint8Array(arrayBuffer);

        const command = new PutObjectCommand({
            Bucket: S3_CONFIG.bucket,
            Key: path,
            Body: body,
            ContentType: file.type,
            ContentLength: file.size, // Explicitly set ContentLength
            ACL: 'public-read'
        });

        await s3Client.send(command);

        // Construct Public URL
        // Supabase Storage Public URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[key]
        // But since we are using S3 protocol, we can construct it or use the standard Supabase URL if we know the project Ref.
        // Based on endpoint: https://tzuzzfoqqbrzshaajjqh.storage.supabase.co...
        // Project ID is likely 'tzuzzfoqqbrzshaajjqh'

        const publicUrl = `https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/public/${S3_CONFIG.bucket}/${path}`;

        return {
            key: path,
            url: publicUrl
        };
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw error;
    }
};

export const getPublicUrl = (path: string) => {
    return `https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/public/${S3_CONFIG.bucket}/${path}`;
};

export const deleteFileFromS3 = async (path: string): Promise<void> => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: S3_CONFIG.bucket,
            Key: path
        });

        await s3Client.send(command);
    } catch (error) {
        console.error("S3 Delete Error:", error);
        throw error;
    }
};
