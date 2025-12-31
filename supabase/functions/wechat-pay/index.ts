import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSign } from "node:crypto";
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

// Helper: Generate Random String
function generateNonce(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Helper: Normalize Private Key (Fixes common env var formatting issues)
function formatPrivateKey(key: string) {
    if (!key) return '';

    // 1. Handle literal "\n" characters
    let clean = key.replace(/\\n/g, '\n');

    // 2. If it is already a well-formed PEM (has headers and internal newlines), return as is
    if (clean.includes('-----BEGIN') && clean.includes('\n') && clean.split('\n').length > 3) {
        return clean;
    }

    // 3. Otherwise, reconstruct standard PEM with 64-char line breaks
    //    Strip everything first
    const body = clean
        .replace(/-----BEGIN [A-Z ]+-----/g, '')
        .replace(/-----END [A-Z ]+-----/g, '')
        .replace(/\s+/g, ''); // Remove all internal whitespace/newlines

    //    Chunk into 64-character lines
    const chunked = body.match(/.{1,64}/g)?.join('\n') || body;

    //    Wrap in PKCS#8 header (standard for WeChat)
    return `-----BEGIN PRIVATE KEY-----\n${chunked}\n-----END PRIVATE KEY-----`;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { amount, pages, description = "OCR Credits Recharge", openId } = await req.json();

        // 0. Authenticate User
        const userAuthHeader = req.headers.get('Authorization');
        if (!userAuthHeader) {
            throw new Error('Missing Authorization header');
        }
        const token = userAuthHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            throw new Error('Invalid user token');
        }

        // 1. Get Secrets
        const appId = Deno.env.get('WECHAT_APP_ID');
        const mchId = Deno.env.get('WECHAT_MCH_ID');
        const serialNo = Deno.env.get('WECHAT_CERT_SERIAL_NO');
        const rawPrivateKey = Deno.env.get('WECHAT_PRIVATE_KEY');

        if (!appId || !mchId || !serialNo || !rawPrivateKey) {
            throw new Error('Missing WeChat Pay configuration in Edge Function Secrets');
        }

        // Normalize Private Key cleanly
        const privateKey = formatPrivateKey(rawPrivateKey);

        // 2. Check Amount
        if (!amount || amount <= 0) {
            throw new Error('Invalid amount');
        }
        const totalFee = Math.round(amount * 100); // Yuan to Fen

        // 3. Prepare Request Data
        const outTradeNo = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const url = "https://api.mch.weixin.qq.com/v3/pay/transactions/native";
        const method = "POST";
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonceStr = generateNonce();

        const bodyObj = {
            appid: appId,
            mchid: mchId,
            description: description,
            out_trade_no: outTradeNo,
            notify_url: "https://tzuzzfoqqbrzshaajjqh.supabase.co/functions/v1/wechat-pay-notify", // Using your project ref
            amount: {
                total: totalFee,
                currency: "CNY"
            }
        };
        const bodyStr = JSON.stringify(bodyObj);

        // 3.5 Insert into Database (Pending)
        const { error: dbError } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: user.id,
                out_trade_no: outTradeNo,
                amount: amount, // Storing in Yuan as per migration
                pages: pages || Math.floor(amount / 0.05), // Fallback calculation if frontend misses it
                status: 'pending',
                description: description
            });

        if (dbError) {
            console.error('Database Insert Error:', dbError);
            throw new Error('Failed to create order record');
        }

        // 4. Generate Signature using Node Crypto (Robust!)
        const message = `${method}\n/v3/pay/transactions/native\n${timestamp}\n${nonceStr}\n${bodyStr}\n`;
        const signer = createSign('RSA-SHA256');
        signer.update(message);
        const signature = signer.sign(privateKey, 'base64');

        // 5. Authorization Header
        const authHeader = `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${serialNo}"`;

        console.log(`Sending request to WeChat Pay: ${outTradeNo} for ${amount} CNY`);

        // 6. Call WeChat API
        const resp = await fetch(url, {
            method: method,
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: bodyStr
        });

        if (!resp.ok) {
            const errorText = await resp.text();
            console.error('WeChat Pay API Error:', resp.status, errorText);
            // Return specific error
            throw new Error(`WeChat Pay API failed (${resp.status}): ${errorText}`);
        }

        const data = await resp.json();

        return new Response(
            JSON.stringify({
                codeUrl: data.code_url,
                outTradeNo: outTradeNo,
                amount: amount,
                message: 'Order created successfully'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error: any) {
        console.error('Function Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
