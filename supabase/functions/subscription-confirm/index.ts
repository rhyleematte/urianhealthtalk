import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const url = new URL(req.url)
  const requestId = url.searchParams.get('id')
  const status = url.searchParams.get('status')

  if (!requestId || !status) {
    return new Response("Missing parameters", { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // 1. Get the request
    const { data: request, error: reqError } = await supabase
      .from('subscription_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (reqError || !request) throw new Error('Request not found')
    if (request.status !== 'pending') throw new Error('Request already processed')

    // 2. Update the request status
    const { error: updateReqError } = await supabase
      .from('subscription_requests')
      .update({ status })
      .eq('id', requestId)

    if (updateReqError) throw updateReqError

    // 3. If approved, update the profile
    let message = "Request declined successfully."
    if (status === 'approved') {
      if (request.type === 'upgrade') {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        const { error: profError } = await supabase
          .from('profiles')
          .update({ 
            plan_type: 'premium', 
            tokens: 999999,
            plan_expires_at: expiresAt.toISOString()
          })
          .eq('id', request.user_id)
        
        if (profError) throw profError
        message = "Your Premium upgrade has been confirmed! Enjoy your new features."
      } else {
        const { error: profError } = await supabase
          .from('profiles')
          .update({ plan_type: 'basic', plan_expires_at: null })
          .eq('id', request.user_id)
        
        if (profError) throw profError
        message = "Your subscription has been canceled. You are now on the Basic plan."
      }
    }

    // Return a nice HTML success page
    return new Response(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 40px; background: white; border-radius: 20px; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h1 style="color: #4f46e5;">Action Successful</h1>
            <p style="font-size: 18px; color: #475569;">${message}</p>
            <p style="margin-top: 20px; color: #94a3b8;">You can now close this window and return to the app.</p>
          </div>
        </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } })

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
})
