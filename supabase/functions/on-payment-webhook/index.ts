/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// supabase/functions/on-payment-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function hexToUint8Array(hex: string) {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return result;
}

serve(async (req) => {
  const { method, headers } = req;

  if (method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const signature = headers.get("x-paystack-signature");
    const body = await req.json();

    // 1. Handle Paystack Webhook
    if (signature) {
      // Verify Paystack Signature (HMAC SHA512)
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(paystackSecretKey),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["verify"]
      );
      
      const bodyText = JSON.stringify(body);
      const isValid = await crypto.subtle.verify(
        "HMAC",
        key,
        hexToUint8Array(signature),
        encoder.encode(bodyText)
      );

      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
      }

      if (body.event === "charge.success") {
        const { reference, customer, amount, currency, metadata } = body.data;
        const userId = metadata?.user_id;

        if (userId) {
          // Update subscription in Supabase
          const renewalDate = new Date();
          renewalDate.setMonth(renewalDate.getMonth() + 1); // 1 month subscription

          await supabase.from("subscriptions").upsert({
            user_id: userId,
            plan_type: "premium",
            amount: amount / 100, // Convert from minor units
            currency: currency,
            status: "active",
            renewal_date: renewalDate.toISOString(),
            payment_reference: reference,
          });
        }
      }
      return new Response(JSON.stringify({ status: "success" }), { status: 200 });
    }

    // 2. Handle M-Pesa Callback (Daraja)
    // M-Pesa sends a POST request to the CallbackURL provided in STK Push
    if (body.Body && body.Body.stkCallback) {
      const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = body.Body.stkCallback;

      if (ResultCode === 0) {
        // Payment Successful
        const metadata = CallbackMetadata.Item;
        const amount = metadata.find((item: any) => item.Name === "Amount").Value;
        const mpesaReceiptNumber = metadata.find((item: any) => item.Name === "MpesaReceiptNumber").Value;
        const phoneNumber = metadata.find((item: any) => item.Name === "PhoneNumber").Value;

        // We need to find the user associated with this CheckoutRequestID
        // In a real app, you'd store the CheckoutRequestID in a 'pending_payments' table
        const { data: pendingPayment } = await supabase
          .from("pending_payments")
          .select("user_id")
          .eq("checkout_request_id", CheckoutRequestID)
          .single();

        if (pendingPayment) {
          const renewalDate = new Date();
          renewalDate.setMonth(renewalDate.getMonth() + 1);

          await supabase.from("subscriptions").upsert({
            user_id: pendingPayment.user_id,
            plan_type: "premium",
            amount: amount,
            currency: "KES",
            status: "active",
            renewal_date: renewalDate.toISOString(),
            payment_reference: mpesaReceiptNumber,
          });
        }
      }
      return new Response(JSON.stringify({ status: "success" }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Invalid webhook" }), { status: 400 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
