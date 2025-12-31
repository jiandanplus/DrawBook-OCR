import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createDecipheriv } from "node:crypto";
import { Buffer } from "node:buffer";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Init Supabase Admin Client
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();

        // 1. Basic Validation
        if (!body.resource || body.resource.algorithm !== 'AEAD_AES_256_GCM') {
            throw new Error('Invalid resource or algorithm');
        }

        const { ciphertext, nonce, associated_data } = body.resource;
        const apiV3Key = Deno.env.get('WECHAT_API_V3_KEY');

        if (!apiV3Key || apiV3Key.length !== 32) {
            throw new Error('Invalid WECHAT_API_V3_KEY configuration');
        }

        // 2. Decryption (AES-256-GCM)
        // WeChat appends Auth Tag (16 bytes) to the end of ciphertext
        const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
        const authTag = ciphertextBuffer.subarray(ciphertextBuffer.length - 16);
        const encryptedData = ciphertextBuffer.subarray(0, ciphertextBuffer.length - 16);

        const decipher = createDecipheriv('aes-256-gcm', apiV3Key, nonce);
        decipher.setAuthTag(authTag);
        decipher.setAAD(Buffer.from(associated_data));

        let decryptedText = decipher.update(encryptedData, undefined, 'utf8');
        decryptedText += decipher.final('utf8');

        const result = JSON.parse(decryptedText);
        console.log('Decrypted WeChat Pay Notification:', result);

        // Result contains: out_trade_no, trade_state, amount, etc.
        /*
        {
            "mchid": "...",
            "appid": "...",
            "out_trade_no": "...",
            "transaction_id": "...", 
            "trade_type": "NATIVE",
            "trade_state": "SUCCESS",
            "trade_state_desc": "支付成功",
            "bank_type": "OTHERS",
            "attach": "",
            "success_time": "2018-06-08T10:34:56+08:00",
            "payer": { "openid": "..." },
            "amount": { "total": 100, "payer_total": 100, "currency": "CNY", "payer_currency": "CNY" }
        }
        */

        if (result.trade_state === 'SUCCESS') {
            const outTradeNo = result.out_trade_no;

            // 3. Update Database (Idempotent Check)
            // First get the transaction to check status and getting total pages to add
            const { data: trx, error: trxError } = await supabaseAdmin
                .from('transactions')
                .select('*')
                .eq('out_trade_no', outTradeNo)
                .single();

            if (trxError || !trx) {
                console.error('Transaction not found or error:', outTradeNo, trxError);
                // Return success to WeChat to stop retry, but log error
                // Or return 500 to retry? If transaction not found, maybe our DB insert failed earlier?
                // We should return 200 to stop retry if it's a "not found" error because retrying won't help.
                // But lets log it.
            } else if (trx.status !== 'success') {

                // Update transaction status
                const { error: updateError } = await supabaseAdmin
                    .from('transactions')
                    .update({
                        status: 'success',
                        updated_at: new Date().toISOString()
                        // could add transaction_id from wechat
                    })
                    .eq('id', trx.id);

                if (!updateError) {
                    // Update User Balance
                    const { error: rpcError } = await supabaseAdmin.rpc('increment_balance_pages', {
                        p_user_id: trx.user_id,
                        p_amount: trx.pages
                    });

                    if (rpcError) {
                        console.error('Failed to update balance:', rpcError);
                        // This is bad. Status success but balance not added.
                        // We might want to revert status or alert admin.
                    } else {
                        console.log(`Balance updated for user ${trx.user_id}: +${trx.pages} pages`);
                    }
                }
            } else {
                console.log('Transaction already processed:', outTradeNo);
            }
        }

        // Return 2xx to acknowledge receipt
        return new Response(JSON.stringify({ code: 'SUCCESS', message: 'OK' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('Notification Error:', error);
        return new Response(JSON.stringify({ code: 'FAIL', message: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
