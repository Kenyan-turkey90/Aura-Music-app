/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// supabase/functions/mpesa-callback/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  try {
    // Parse M-Pesa callback payload
    const callbackData = await req.json()
    
    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2))
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Extract payment details
    const { Body } = callbackData
    const { stkCallback } = Body
    
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback
    
    // Determine payment status
    const status = ResultCode === 0 ? 'success' : 'failed'
    
    // 1. Log the raw payment result
    await supabase.from('payments').insert({
      transaction_id: CheckoutRequestID,
      merchant_request_id: MerchantRequestID,
      status: status,
      result_desc: ResultDesc,
      provider: 'mpesa',
      raw_response: callbackData,
      created_at: new Date().toISOString()
    })
    
    // 2. If successful, update the user's subscription
    if (ResultCode === 0 && CallbackMetadata) {
      const metadata = CallbackMetadata.Item;
      const amount = metadata.find((item: any) => item.Name === "Amount")?.Value;
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;

      // Find the user associated with this CheckoutRequestID from our pending_payments table
      const { data: pendingPayment } = await supabase
        .from("pending_payments")
        .select("user_id")
        .eq("checkout_request_id", CheckoutRequestID)
        .single();

      if (pendingPayment) {
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1); // 1 month subscription

        await supabase.from("subscriptions").upsert({
          user_id: pendingPayment.user_id,
          plan_type: "premium",
          amount: amount,
          currency: "KES",
          status: "active",
          renewal_date: renewalDate.toISOString(),
          payment_reference: mpesaReceiptNumber || CheckoutRequestID,
        });

        // Update pending payment status
        await supabase
          .from("pending_payments")
          .update({ status: 'completed' })
          .eq("checkout_request_id", CheckoutRequestID);
      }
    } else if (ResultCode !== 0) {
      // Update pending payment status to failed
      await supabase
        .from("pending_payments")
        .update({ status: 'failed' })
        .eq("checkout_request_id", CheckoutRequestID);
    }
    
    // Return success response to M-Pesa (Daraja expects a 200 OK)
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Callback Error:', error)
    
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: "Error processing callback" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
