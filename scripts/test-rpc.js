/**
 * Test RPC function log_usage_and_decrement
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

// simulate a user - we need to find a real user first
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testRpc() {
    console.log('🧪 Testing RPC log_usage_and_decrement...\n');

    // 1. Get a user
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.users[0];

    if (!user) {
        console.error('❌ No users found');
        return;
    }
    console.log(`👤 Testing with user: ${user.id} (${user.email})`);

    // 2. Call RPC as that user (using postgres RLS impersonation or just verifying function works)
    // Note: Calling rpc with service key behaves as superuser usually, but we want to test if it Writes.
    // The function is SECURITY DEFINER so it should work even if called by authenticated user.

    const { data, error } = await supabaseAdmin.rpc('log_usage_and_decrement', {
        p_user_id: user.id,
        p_pages: 5,
        p_file_name: 'test_rpc_script.pdf'
    });

    if (error) {
        console.error('❌ RPC Error:', error);
    } else {
        console.log(`✅ RPC Success! New Balance: ${data}`);
    }

    // 3. Verify Log
    const { data: logs } = await supabaseAdmin
        .from('usage_logs')
        .select('*')
        .eq('file_name', 'test_rpc_script.pdf');

    console.log('📊 Logs found:', logs);
}

testRpc();
