import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-api-contact-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/contact' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const { name, email, message } = JSON.parse(body);
                  const apiKey = env.RESEND_API_KEY;

                  if (!apiKey) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Missing RESEND_API_KEY in local environment.' }));
                    return;
                  }

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
                      subject: `CursorX: New Inquiry from ${name} (Dev)`,
                      html: `
                        <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                          <div style="border-bottom: 2px solid #7c5cfc; padding-bottom: 12px; margin-bottom: 20px;">
                            <h2 style="color: #0f172a; margin: 0; font-size: 20px;">New Contact Form Submission</h2>
                            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">CursorX Workspace Inquiry (Local Dev Mode)</p>
                          </div>
                          <div style="margin-bottom: 24px; line-height: 1.5; font-size: 14px;">
                            <p style="margin: 0 0 8px 0;"><strong style="color: #475569;">Sender Name:</strong> ${name}</p>
                            <p style="margin: 0 0 16px 0;"><strong style="color: #475569;">Sender Email:</strong> <a href="mailto:${email}" style="color: #7c5cfc; text-decoration: none;">${email}</a></p>
                            <div style="background-color: #f8fafc; border-left: 4px solid #7c5cfc; padding: 16px; border-radius: 0 8px 8px 0;">
                              <p style="margin: 0; font-style: italic; color: #475569; white-space: pre-line;">"${message}"</p>
                            </div>
                          </div>
                          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">This email was securely routed from the local CursorX dev server middleware. Click "Reply" to respond directly to the sender.</p>
                        </div>
                      `,
                    }),
                  });

                  const devMailData = await devMailRes.json();
                  if (!devMailRes.ok) {
                    console.error('Local dev notification failed:', devMailData);
                    res.statusCode = devMailRes.status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: devMailData.message || 'Developer notification email failed.' }));
                    return;
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
                      subject: 'We received your message - CursorX Support (Dev)',
                      html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                          <h2 style="color: #7c5cfc;">Thank you for contacting us!</h2>
                          <p>Hello ${name},</p>
                          <p>This is a confirmation copy to let you know that your message has been received on our local dev server. I (Felix Au) will review your request and get back to you as soon as possible.</p>
                          <p>Here is a summary of the details you submitted:</p>
                          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
                            <p style="margin: 0 0 10px 0;"><strong>Your Message:</strong></p>
                            <p style="margin: 0; font-style: italic; color: #475569;">"${message.replace(/\n/g, '<br/>')}"</p>
                          </div>
                          <p>Best regards,<br/>The CursorX Team</p>
                          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                          <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated confirmation email copy from local dev mode.</p>
                        </div>
                      `,
                    }),
                  });

                  if (!userMailRes.ok) {
                    const userMailData = await userMailRes.json();
                    console.warn('User confirmation email copy failed in local dev:', userMailData);
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                } catch (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Internal server error.' }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ]
  };
});

