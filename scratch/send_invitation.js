const RESEND_API_KEY = 're_5JadUw8g_FK2wN113gm7vix3479X7XVHB';

async function sendInvitation() {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Urian Solace <onboarding@resend.dev>',
      to: 'rhyleematte@gmail.com',
      subject: 'You are invited to Urian Solace AI!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #4f46e5;">Welcome to Urian Solace</h1>
          <p>Hi there,</p>
          <p>You have been invited to join <strong>Urian Solace AI</strong>, your personal sanctuary for mental wellness and dialogue.</p>
          <p>Experience our premium features including unlimited AI tokens and advanced emotional analytics.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://rgucydqdqfwjnkveibhr.supabase.co" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started</a>
          </div>
          <p>Stay peaceful,<br/>The Urian Solace Team</p>
        </div>
      `,
    }),
  });

  const data = await res.json();
  console.log('Email sent:', data);
}

sendInvitation();
