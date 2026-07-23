export default async function handler(req, res) {
  // CORS configuration (allow requests from the app itself)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing name, email, or message.' });
  }

  // Use production environment variable (which is secure and not prefixed with VITE_)
  // Vercel dashboard lets you specify RESEND_API_KEY directly.
  // Fall back to VITE_RESEND_API_KEY just in case the host configuration has it that way.
  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  try {
    // 1. Send Developer Notification Email
    const devMailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CursorX <cursorx@felixau.in>',
        to: 'felixaugum@gmail.com',
        reply_to: email,
        subject: `CursorX: New Inquiry from ${name}`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="border-bottom: 2px solid #7c5cfc; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin: 0; font-size: 20px;">New Contact Form Submission</h2>
              <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">CursorX Workspace Inquiry</p>
            </div>
            <div style="margin-bottom: 24px; line-height: 1.5; font-size: 14px;">
              <p style="margin: 0 0 8px 0;"><strong style="color: #475569;">Sender Name:</strong> ${name}</p>
              <p style="margin: 0 0 16px 0;"><strong style="color: #475569;">Sender Email:</strong> <a href="mailto:${email}" style="color: #7c5cfc; text-decoration: none;">${email}</a></p>
              <div style="background-color: #f8fafc; border-left: 4px solid #7c5cfc; padding: 16px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-style: italic; color: #475569; white-space: pre-line;">"${message}"</p>
              </div>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">This email was securely routed from the CursorX Workspace contact form. Click "Reply" to respond directly to the sender.</p>
          </div>
        `,
      }),
    });

    const devMailData = await devMailRes.json();
    if (!devMailRes.ok) {
      console.error('Developer notification failed:', devMailData);
      return res.status(devMailRes.status).json({ error: devMailData.message || 'Developer notification email failed.' });
    }

    // 2. Send Sender Confirmation Email
    const userMailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CursorX Support <cursorx@felixau.in>',
        to: email,
        subject: 'We received your message - CursorX Support',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #7c5cfc;">Thank you for contacting us!</h2>
            <p>Hello ${name},</p>
            <p>This is a confirmation copy to let you know that your message has been received. I (Felix Au) will review your request and get back to you as soon as possible.</p>
            <p>Here is a summary of the details you submitted:</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Your Message:</strong></p>
              <p style="margin: 0; font-style: italic; color: #475569;">"${message.replace(/\n/g, '<br/>')}"</p>
            </div>
            <p>Best regards,<br/>The CursorX Team</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated confirmation email. Please do not reply directly to this message.</p>
          </div>
        `,
      }),
    });

    if (!userMailRes.ok) {
      const userMailData = await userMailRes.json();
      console.warn('User confirmation email copy failed:', userMailData);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error while dispatching emails.' });
  }
}
