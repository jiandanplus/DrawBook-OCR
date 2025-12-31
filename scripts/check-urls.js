/**
 * Verify current example_files URLs in database
 */

import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUrls() {
    console.log('📋 Checking example_files URLs...\n');

    const { data: files, error } = await supabase
        .from('example_files')
        .select('id, name, url')
        .order('created_at');

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    let ownStorage = 0;
    let thirdParty = 0;

    for (const file of files) {
        const isOwn = file.url && file.url.includes('tzuzzfoqqbrzshaajjqh.supabase.co');
        const status = isOwn ? '✅' : '❌';
        console.log(`${status} ${file.name}: ${file.url?.substring(0, 60)}...`);
        if (isOwn) ownStorage++;
        else thirdParty++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Own storage: ${ownStorage}`);
    console.log(`   ❌ Third-party: ${thirdParty}`);
}

checkUrls();
