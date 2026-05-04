import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const PROJECT_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const REDIRECT_URL = "https://urianhealthtalk.vercel.app/verify"

serve(async (req) => {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const status = url.searchParams.get('status')

  if (!id || !status) {
    return Response.redirect(`${REDIRECT_URL}?status=error&message=Missing+parameters`)
  }

  const supabase = createClient(PROJECT_URL ?? '', SERVICE_ROLE_KEY ?? '')

  try {
    const { data: request, error: fetchError } = await supabase
      .from('subscription_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !request) {
      return Response.redirect(`${REDIRECT_URL}?status=error&message=Request+not+found`)
    }
    
    if (request.status !== 'pending') {
       return Response.redirect(`${REDIRECT_URL}?status=error&message=Request+already+processed`)
    }

    await supabase.from('subscription_requests').update({ status }).eq('id', id)

    if (status === 'approved') {
      const planType = request.type === 'upgrade' ? 'premium' : 'free'
      const expiresAt = request.type === 'upgrade' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      
      await supabase.from('profiles').update({ 
        plan_type: planType,
        plan_expires_at: expiresAt
      }).eq('id', request.user_id)
      
      const msg = request.type === 'upgrade' ? "Your+account+is+now+Premium!" : "Your+subscription+has+been+cancelled."
      return Response.redirect(`${REDIRECT_URL}?status=success&message=${msg}`)
    } else {
      return Response.redirect(`${REDIRECT_URL}?status=success&message=The+request+was+declined.`)
    }

  } catch (err) {
    return Response.redirect(`${REDIRECT_URL}?status=error&message=${encodeURIComponent(err.message)}`)
  }
})
