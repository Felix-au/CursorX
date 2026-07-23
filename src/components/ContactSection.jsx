import { useState } from 'react';



export default function ContactSection({ index }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' }); // type: 'success' | 'error' | 'submitting'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (!email.includes('@')) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setStatus({ type: 'submitting', text: 'Sending Message...' });

    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    if (!apiKey) {
      console.error('Missing VITE_RESEND_API_KEY environment variable.');
      setStatus({ type: 'error', text: 'Mail configuration error. Missing API key.' });
      return;
    }

    try {
      // 1. Email 1: Developer Notification
      const devMailRes = await fetch('/api/resend/emails', {
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
        console.error('Developer notification mail failed:', devMailData);
        setStatus({ type: 'error', text: devMailData.message || 'Failed to dispatch developer notification email.' });
        return; // Abort second email if first fails
      }

      // 2. Email 2: Sender Confirmation Copy
      const userMailRes = await fetch('/api/resend/emails', {
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

      const userMailData = await userMailRes.json();
      if (!userMailRes.ok) {
        console.warn('User confirmation copy email failed to dispatch:', userMailData);
      }

      setStatus({ type: 'success', text: 'Message sent successfully' });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Contact submit error:', err);
      setStatus({ type: 'error', text: 'Failed to send message due to network or connection issues.' });
    }
  };

  return (
    <div className="slide contact-slide" id={`slide-${index}`}>
      {/* Background decoration matching website grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(124,92,252,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,92,252,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div className="contact-container" style={{ zIndex: 1 }}>
        <div className="contact-card glass-panel">
          <div className="contact-header">
            <h2 className="contact-title">
              <span className="gradient-text">Contact</span> Developer
            </h2>
            <p className="contact-sub">
              Submit a request to developers or report an issue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                disabled={status.type === 'submitting'}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">Email Address</label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={status.type === 'submitting'}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                rows={4}
                disabled={status.type === 'submitting'}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary contact-btn"
              disabled={status.type === 'submitting'}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {status.type === 'submitting' ? 'Sending Message...' : 'Send Message'}
            </button>

            {status.text && (
              <div className={`form-status ${status.type}`}>
                <span className="status-dot" />
                {status.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
