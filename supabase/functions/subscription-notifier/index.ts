import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const EMAILJS_SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID')
const EMAILJS_TEMPLATE_ID = Deno.env.get('EMAILJS_TEMPLATE_ID')
const EMAILJS_PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY')
const PROJECT_URL = Deno.env.get('SUPABASE_URL')

serve(async (req) => {
  try {
    const { record, type } = await req.json()

    if (type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Skipping non-insert event' }), { status: 200 })
    }

    const supabase = createClient(
      PROJECT_URL ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: user, error: userError } = await supabase.auth.admin.getUserById(record.user_id)
    if (userError || !user) throw new Error('User not found')

    const email = user.user.email
    const requestType = record.type === 'upgrade' ? 'Upgrade to Premium' : 'Cancel Subscription'
    
    // Redirect to the Vercel page instead of the Edge Function directly
    const verifyPageUrl = `https://urianhealthtalk.vercel.app/verify?id=${record.id}`

    console.log(`Sending EmailJS verification to ${email} pointing to Vercel`)

    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          subject: `Action Required: ${requestType}`,
          message: `Hello,

We received a request to ${record.type} your plan for Urian Solace AI.

Please review and confirm this request by clicking the button below:

${verifyPageUrl}

If you did not make this request, you can safely ignore this email.

Stay peaceful,
The Urian Solace Team`
        },
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`EmailJS Error: ${errorText}`)
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
