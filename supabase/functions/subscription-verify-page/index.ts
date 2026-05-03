import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const url = new URL(req.url)
  const requestId = url.searchParams.get('id')

  if (!requestId) {
    return new Response("Missing Request ID", { status: 400 })
  }

  const confirmBaseUrl = `https://rgucydqdqfwjnkveibhr.supabase.co/functions/v1/subscription-confirm`
  const acceptLink = `${confirmBaseUrl}?id=${requestId}&status=approved`
  const declineLink = `${confirmBaseUrl}?id=${requestId}&status=declined`

  // Return a beautiful HTML page with buttons
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Subscription - Urian Solace</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; width: 90%; }
        h1 { color: #4f46e5; margin-bottom: 8px; font-size: 24px; }
        p { color: #64748b; margin-bottom: 32px; line-height: 1.5; }
        .actions { display: flex; flex-direction: column; gap: 12px; }
        .btn { padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s; border: none; cursor: pointer; }
        .btn-accept { background-color: #34a853; color: white; }
        .btn-accept:hover { background-color: #2d9249; transform: translateY(-1px); }
        .btn-decline { background-color: #f1f5f9; color: #64748b; }
        .btn-decline:hover { background-color: #e2e8f0; color: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <div style="font-size: 48px; margin-bottom: 20px;">🧘‍♂️</div>
        <h1>Review Request</h1>
        <p>Would you like to confirm the subscription change for your Urian Solace AI account?</p>
        <div class="actions">
          <a href="${acceptLink}" class="btn btn-accept">Accept & Confirm</a>
          <a href="${declineLink}" class="btn btn-decline">Decline Request</a>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">Request ID: ${requestId}</p>
      </div>
    </body>
    </html>
  `, { headers: { "Content-Type": "text/html" } })
})
