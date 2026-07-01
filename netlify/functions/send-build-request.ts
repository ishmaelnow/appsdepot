import type { Handler } from '@netlify/functions'
import { Resend } from 'resend'
import { createServerSupabase, getRequestUserId, isSupabaseServerConfigured } from './_supabase'

const resend  = new Resend(process.env.RESEND_API_KEY)
const TO      = process.env.RESEND_TO_EMAIL   ?? 'coachishmael@gmail.com'
const FROM    = process.env.RESEND_FROM_EMAIL ?? 'requests@appsdepot.com'

interface RequestedAppBody {
  slug?: string
  name: string
  category?: string
  startingPrice: string
  buildTime: string
}

interface BuildRequestBody {
  name: string
  email: string
  phone?: string
  company?: string
  requirements: string
  budgetRange: string
  timeline: string
  preferredStack?: string
  apps: RequestedAppBody[]
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value: string | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body: BuildRequestBody
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { name, email, phone, company, requirements, budgetRange, timeline, preferredStack, apps } = body

  if (!name?.trim() || !isEmail(email) || !requirements?.trim() || !budgetRange || !timeline || !apps?.length) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required build request fields' }) }
  }

  if (!isSupabaseServerConfigured) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Supabase is not configured for server requests' }) }
  }

  const authHeader = event.headers.authorization ?? event.headers.Authorization
  const customerUserId = await getRequestUserId(authHeader)
  const supabase = createServerSupabase(authHeader)
  if (!supabase) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Supabase client could not be created' }) }
  }

  const { data: savedRequest, error: requestError } = await supabase
    .from('build_requests')
    .insert({
      customer_user_id: customerUserId,
      customer_name: name.trim(),
      customer_email: email.trim().toLowerCase(),
      customer_phone: phone?.trim() || null,
      company: company?.trim() || null,
      requirements: requirements.trim(),
      budget_range: budgetRange,
      timeline,
      preferred_stack: preferredStack?.trim() || null,
      source: 'website',
    })
    .select('id, request_number')
    .single()

  if (requestError || !savedRequest) {
    console.error('Supabase build request insert error:', requestError)
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save build request' }) }
  }

  const { error: appsError } = await supabase
    .from('build_request_apps')
    .insert(apps.map(app => ({
      build_request_id: savedRequest.id,
      app_slug: app.slug ?? null,
      app_name: app.name,
      category: app.category ?? null,
      starting_price: app.startingPrice,
      build_time: app.buildTime,
    })))

  if (appsError) {
    console.error('Supabase build request apps insert error:', appsError)
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save requested apps' }) }
  }

  const appRows = apps.map(a =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;font-weight:600;color:#1c1917">${escapeHtml(a.name)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;color:#57534e">${escapeHtml(a.startingPrice)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;color:#57534e">${escapeHtml(a.buildTime)}</td>
    </tr>`
  ).join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4">

    <!-- Header -->
    <div style="background:#1c1917;padding:24px 32px;display:flex;align-items:center;gap:12px">
      <div style="background:#f97316;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px">🏗️</div>
      <div>
        <div style="color:#fff;font-weight:900;font-size:18px;line-height:1">APPS <span style="color:#f97316">DEPOT</span></div>
        <div style="color:#a8a29e;font-size:12px;margin-top:2px">New Build Request</div>
      </div>
    </div>

    <!-- Orange bar -->
    <div style="height:4px;background:#f97316"></div>

    <!-- Body -->
    <div style="padding:32px">
      <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#1c1917">New Build Request ${escapeHtml(savedRequest.request_number)}</h1>
      <p style="margin:0 0 24px;color:#78716c;font-size:14px">Submitted ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>

      <!-- Client info -->
      <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;padding:16px 20px;margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;margin-bottom:10px">Client</div>
        <div style="font-size:16px;font-weight:700;color:#1c1917">${escapeHtml(name)}${company ? ` — ${escapeHtml(company)}` : ''}</div>
        <a href="mailto:${escapeHtml(email)}" style="color:#f97316;font-size:14px;text-decoration:none">${escapeHtml(email)}</a>
        ${phone ? `<div style="color:#57534e;font-size:14px;margin-top:4px">${escapeHtml(phone)}</div>` : ''}
      </div>

      <!-- Apps requested -->
      <div style="margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;margin-bottom:10px">Apps Requested</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e7e5e4;border-radius:8px;overflow:hidden">
          <thead>
            <tr style="background:#fafaf9">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#78716c;font-weight:600">App</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#78716c;font-weight:600">Starting From</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#78716c;font-weight:600">Build Time</th>
            </tr>
          </thead>
          <tbody>${appRows}</tbody>
        </table>
      </div>

      <!-- Requirements -->
      <div style="margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;margin-bottom:8px">Requirements</div>
        <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:8px;padding:14px 16px;font-size:14px;color:#1c1917;line-height:1.6;white-space:pre-wrap">${escapeHtml(requirements)}</div>
      </div>

      <!-- Budget & Timeline -->
      <div style="display:flex;gap:12px;margin-bottom:20px">
        <div style="flex:1;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#92400e;margin-bottom:4px">Budget</div>
          <div style="font-size:14px;font-weight:700;color:#1c1917">${escapeHtml(budgetRange)}</div>
        </div>
        <div style="flex:1;background:#e0f2fe;border:1px solid #bae6fd;border-radius:8px;padding:14px 16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#075985;margin-bottom:4px">Timeline</div>
          <div style="font-size:14px;font-weight:700;color:#1c1917">${escapeHtml(timeline)}</div>
        </div>
      </div>

      ${preferredStack ? `
      <!-- Tech stack -->
      <div style="margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;margin-bottom:8px">Preferred Stack</div>
        <div style="font-size:14px;color:#1c1917">${escapeHtml(preferredStack)}</div>
      </div>` : ''}

      <!-- Reply CTA -->
      <a href="mailto:${escapeHtml(email)}?subject=Re: Your Apps Depot Build Request ${escapeHtml(savedRequest.request_number)}"
        style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:8px">
        Reply to ${escapeHtml(name.split(' ')[0])}
      </a>
    </div>

    <div style="border-top:1px solid #e7e5e4;padding:16px 32px;text-align:center;color:#a8a29e;font-size:12px">
      Apps Depot · coachishmael@gmail.com · (469) 835-7520 · This email was triggered by a build request form submission.
    </div>
  </div>
</body>
</html>`

  try {
    await resend.emails.send({
      from:    FROM,
      to:      TO,
      replyTo: email,
      subject: `🏗️ ${savedRequest.request_number} — New Build Request from ${name}${company ? ` (${company})` : ''}`,
      html,
    })
    return { statusCode: 200, body: JSON.stringify({ success: true, requestNumber: savedRequest.request_number }) }
  } catch (err) {
    console.error('Resend error:', err)
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        requestNumber: savedRequest.request_number,
        warning: 'Request saved, but the email notification could not be sent.',
      }),
    }
  }
}
