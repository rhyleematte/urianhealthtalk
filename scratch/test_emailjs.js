const fetch = require('node-fetch');

async function testEmailJS() {
  const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost' // Sometimes needed
    },
    body: JSON.stringify({
      service_id: 'service_qdc37xp',
      template_id: 'template_j8hdvco',
      user_id: '09Gsr7RV8OUKxuGZG',
      template_params: {
        to_email: 'rhyleematte@gmail.com',
        subject: 'EmailJS Test',
        message: 'This is a test after turning OFF private key!'
      },
    }),
  });

  if (emailResponse.ok) {
    console.log('EmailJS Test Successful!');
  } else {
    const errorText = await emailResponse.text();
    console.error('EmailJS Test Failed:', errorText);
  }
}

testEmailJS();
