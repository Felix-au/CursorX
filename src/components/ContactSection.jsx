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

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', text: data.error || 'Failed to dispatch message.' });
        return;
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
