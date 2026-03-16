import type { Handler } from '@netlify/functions'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO     = process.env.RESEND_TO_EMAIL   ?? 'hello@appsdepot.com'
const FROM   = process.env.RESEND_FROM_EMAIL ?? 'wishes@appsdepot.com'

interface WishBody {
  title: string
  categoryName?: string
  description: string
  targetUsers?: string
  features: string[]
  inspiration?: string
  budgetRange?: string
  timeline?: string
  name: string
  email: string
  company?: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body: WishBody
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { title, categoryName, description, targetUsers, features, inspiration, budgetRange, timeline, name, email, company } = body

  const filledFeatures = features.filter(Boolean)

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4">

    <!-- Header -->
    <div style="background:#1c1917;padding:24px 32px;display:flex;align-items:center;gap:12px">
      <div style="background:#eab308;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px">✨</div>
      <div>
        <div style="color:#fff;font-weight:900;font-size:18px;line-height:1">APPS <span style="color:#f97316">DEPOT</span></div>
        <div style="color:#a8a29e;font-size:12px;margin-top:2px">New App Wish</div>
      </div>
    </div>

    <!-- Yellow bar -->
    <div style="height:4px;background:#eab308"></div>

    <!-- Body -->
    <div style="padding:32px">
      <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#1c1917">✨ New App Wish</h1>
      <p style="margin:0 0 24px;color:#78716c;font-size:14px">Submitted ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>

      <!-- App title -->
      <div style="background:#fef9c3;border:1px solid #fde047;border-radius:12px;padding:16px 20px;margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#854d0e;margin-bottom:6px">Wished App</div>
        <div style="font-size:20px;font-weight:900;color:#1c1917">${title}</div>
        ${categoryName ? `<div style="margin-top:6px;font-size:13px;color:#78716c">Category: ${categoryName}</div>` : ''}
      </div>

      <!-- Client info -->
      <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;padding:16px 20px;margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;margin-bottom:10px">Submitted by</div>
        <div style="font-size:16px;font-weight:700;color:#1c1917">${name}${company ? ` — ${company}` : ''}</div>
        <a href="mailto:${email}" style="color:#f97316;font-size:14px;text-decoration:none">${email}</a>
      </div>

      <!-- Description -->
      <div style="margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;margin-bottom:8px">Description</div>
        <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:8px;padding:14px 16px;font-size:14px;color:#1c1917;line-height:1.6;white-space:pre-wrap">${description}</div>
      </div>

      ${targetUsers ? `
      <div style="margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;margin-bottom:8px">Target Users</div>
        <div style="font-size:14px;color:#1c1917">${targetUsers}</div>
      </div>` : ''}

      ${filledFeatures.length > 0 ? `
      <div style="margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;margin-bottom:8px">Key Features</div>
        <ul style="margin:0;padding-left:20px;">
          ${filledFeatures.map(f => `<li style="font-size:14px;color:#1c1917;margin-bottom:4px">${f}</li>`).join('')}
        </ul>
      </div>` : ''}

      ${inspiration ? `
      <div style="margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;margin-bottom:8px">Inspired by</div>
        <div style="font-size:14px;color:#1c1917;font-style:italic">"${inspiration}"</div>
      </div>` : ''}

      <!-- Budget & Timeline -->
      ${budgetRange || timeline ? `
      <div style="display:flex;gap:12px;margin-bottom:24px">
        ${budgetRange ? `
        <div style="flex:1;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#92400e;margin-bottom:4px">Budget</div>
          <div style="font-size:14px;font-weight:700;color:#1c1917">${budgetRange}</div>
        </div>` : ''}
        ${timeline ? `
        <div style="flex:1;background:#e0f2fe;border:1px solid #bae6fd;border-radius:8px;padding:14px 16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#075985;margin-bottom:4px">Timeline</div>
          <div style="font-size:14px;font-weight:700;color:#1c1917">${timeline}</div>
        </div>` : ''}
      </div>` : ''}

      <!-- Reply CTA -->
      <a href="mailto:${email}?subject=Re: Your Apps Depot App Wish — ${encodeURIComponent(title)}"
        style="display:inline-block;background:#eab308;color:#1c1917;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none">
        Reply to ${name.split(' ')[0]}
      </a>
    </div>

    <div style="border-top:1px solid #e7e5e4;padding:16px 32px;text-align:center;color:#a8a29e;font-size:12px">
      Apps Depot · appsdepot.com · This email was triggered by an App Wish form submission.
    </div>
  </div>
</body>
</html>`

  try {
    await resend.emails.send({
      from:    FROM,
      to:      TO,
      replyTo: email,
      subject: `✨ App Wish: "${title}" from ${name}${company ? ` (${company})` : ''}`,
      html,
    })
    return { statusCode: 200, body: JSON.stringify({ success: true }) }
  } catch (err) {
    console.error('Resend error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send email' }) }
  }
}
