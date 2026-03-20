/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// supabase/functions/paystack-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

serve(async (req: Request) => {
  try {
    const signature = req.headers.get('x-paystack-signature')
    if (!signature) {
      return new Response('No signature', { status: 401 })
    }

    const body = await req.text()
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''
    
    // Verify signature
    const hmac = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    )
    const signed = await crypto.subtle.sign(
      "HMAC",
      hmac,
      new TextEncoder().encode(body)
    )
    const hash = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    if (hash !== signature) {
      return new Response('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('Paystack Event Received:', event.event)

    if (event.event === 'charge.success') {
      const { data: { customer, reference, amount, currency } } = event
      const email = customer.email

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Find user by email
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (user) {
        const renewalDate = new Date()
        renewalDate.setMonth(renewalDate.getMonth() + 1)

        await supabase.from('subscriptions').upsert({
          user_id: user.id,
          plan_type: 'premium',
          amount: amount / 100, // Paystack is in kobo/cents
          currency: currency,
          status: 'active',
          renewal_date: renewalDate.toISOString(),
          payment_reference: reference,
          updated_at: new Date().toISOString()
        })
      }
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
