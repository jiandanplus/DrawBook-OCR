/**
 * Check usage logs and profile for current user
 */

import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkUsageData() {
    console.log('📋 Checking usage data...\n');

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

    console.log('👤 Profiles:', profiles?.length || 0);
    if (profilesError) console.error('  Error:', profilesError.message);
    profiles?.forEach(p => {
        console.log(`   - ${p.id}: ${p.balance_pages} pages remaining`);
    });

    // Get all usage logs
    const { data: logs, error: logsError } = await supabase
        .from('usage_logs')
        .select('*')
        .order('created_at', { ascending: false });

    console.log('\n📊 Usage Logs:', logs?.length || 0);
    if (logsError) console.error('  Error:', logsError.message);
    logs?.forEach(l => {
        console.log(`   - ${new Date(l.created_at).toLocaleString()}: ${l.pages_processed} pages (${l.file_name})`);
    });
}

checkUsageData();
