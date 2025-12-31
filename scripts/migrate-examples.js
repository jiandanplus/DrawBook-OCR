/**
 * Migration script: Download example files from third-party URLs
 * and re-upload them to own Supabase S3 storage
 * 
 * Usage: node scripts/migrate-examples.js
 */

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// ============ Configuration ============
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY in .env.local');
    console.error('   Please add your Supabase service_role key to .env.local');
    process.exit(1);
}

const S3_CONFIG = {
    endpoint: 'https://tzuzzfoqqbrzshaajjqh.storage.supabase.co/storage/v1/s3',
    region: 'ap-south-1',
    bucket: 'OCR',
    credentials: {
        accessKeyId: '877ac66df56d64bba1d9861d3c92cb4f',
        secretAccessKey: '65acacb6c8d7a2bc260663174993b8a1cee0e4360b08a860c2435cc210fb4f00'
    }
};

// ============ Initialize Clients ============
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const s3Client = new S3Client({
    region: S3_CONFIG.region,
    endpoint: S3_CONFIG.endpoint,
    credentials: S3_CONFIG.credentials,
    forcePathStyle: true
});

// ============ Helper Functions ============
function getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    return types[ext] || 'application/octet-stream';
}

function getPublicUrl(filePath) {
    return `https://tzuzzfoqqbrzshaajjqh.supabase.co/storage/v1/object/public/${S3_CONFIG.bucket}/${filePath}`;
}

async function downloadFile(url) {
    console.log(`  📥 Downloading from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.buffer();
    return buffer;
}

async function uploadToS3(buffer, filePath, contentType) {
    console.log(`  📤 Uploading to S3: ${filePath}`);
    const command = new PutObjectCommand({
        Bucket: S3_CONFIG.bucket,
        Key: filePath,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.length,
        ACL: 'public-read'
    });
    await s3Client.send(command);
    return getPublicUrl(filePath);
}

async function updateDatabaseUrl(fileId, newUrl) {
    console.log(`  💾 Updating database URL for ${fileId}`);
    const { error } = await supabase
        .from('example_files')
        .update({ url: newUrl })
        .eq('id', fileId);

    if (error) throw error;
}

// ============ Main Migration ============
async function migrateExampleFiles() {
    console.log('🚀 Starting example files migration...\n');

    // 1. Fetch all example files
    const { data: files, error } = await supabase
        .from('example_files')
        .select('*');

    if (error) {
        console.error('❌ Error fetching example files:', error);
        process.exit(1);
    }

    console.log(`📋 Found ${files.length} example files to migrate\n`);

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const file of files) {
        console.log(`\n📄 Processing: ${file.name}`);

        // Skip if already migrated (URL points to our storage)
        if (file.url && file.url.includes('tzuzzfoqqbrzshaajjqh.supabase.co')) {
            console.log(`  ⏭️  Already migrated, skipping`);
            skipCount++;
            continue;
        }

        if (!file.url) {
            console.log(`  ⚠️  No URL found, skipping`);
            skipCount++;
            continue;
        }

        try {
            // Extract filename from URL
            const urlPath = new URL(file.url).pathname;
            const originalFilename = path.basename(urlPath);

            // Determine extension from file.type or URL
            let ext = path.extname(decodeURIComponent(originalFilename));
            if (!ext && file.type) {
                ext = file.type.startsWith('.') ? file.type : `.${file.type}`;
            }

            // Use file.id (UUID) as filename to avoid encoding issues
            const s3Path = `examples/${file.id}${ext}`;

            // Download file
            const buffer = await downloadFile(file.url);

            // Upload to S3
            const contentType = getContentType(s3Path);
            const newUrl = await uploadToS3(buffer, s3Path, contentType);

            // Update database
            await updateDatabaseUrl(file.id, newUrl);

            console.log(`  ✅ Success! New URL: ${newUrl}`);
            successCount++;

        } catch (err) {
            console.error(`  ❌ Failed: ${err.message}`);
            failCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log('='.repeat(50));

    if (failCount === 0) {
        console.log('\n🎉 Migration completed successfully!');
    } else {
        console.log('\n⚠️  Some files failed to migrate. Please check the errors above.');
    }
}

// Run
migrateExampleFiles().catch(console.error);
