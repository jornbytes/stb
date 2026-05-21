import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { naam, email, onderwerp, bericht } = await req.json();

    if (!naam || !email) {
      return new Response(JSON.stringify({ error: "Ontbrekende velden" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Haal afzenderinstellingen en subscribers op
    const [{ data: settingsRows }, { data: subscriberRows }] = await Promise.all([
      supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["mail_from_name", "mail_from_email", "contact_email"]),
      supabase
        .from("form_notification_subscribers")
        .select("website_users(email, display_name)")
        .eq("form_type", "contact"),
    ]);

    const settings: Record<string, string> = {};
    (settingsRows ?? []).forEach((r: { key: string; value: string }) => {
      settings[r.key] = r.value;
    });

    const fromName  = settings.mail_from_name  || "Scouting Titus Brandsma";
    const fromEmail = settings.mail_from_email || `noreply@${Deno.env.get("RESEND_DOMAIN") ?? "resend.dev"}`;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ success: true, skipped: "no_resend_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Bevestigingsmail naar inzender ──────────────────────────────────────
    const bevestigingHtml = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);max-width:560px;">
        <tr>
          <td style="background:#071a0b;padding:28px 40px;">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;font-family:system-ui,sans-serif;">Scouting</span>
            <span style="color:#c0392b;font-size:22px;font-weight:700;margin-left:2px;">.</span>
            <br>
            <span style="color:#ffffff;opacity:0.5;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Titus Brandsma</span>
          </td>
        </tr>
        <tr><td style="background:#2d6a4f;height:4px;"></td></tr>
        <tr>
          <td style="padding:40px 40px 32px;color:#374151;font-size:15px;line-height:1.75;">
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#071a0b;">Hoi ${naam}!</p>
            <p style="margin:0 0 16px;">We hebben jouw bericht ontvangen en nemen zo snel mogelijk contact met je op.</p>
            ${onderwerp ? `<p style="margin:0 0 16px;"><strong style="color:#071a0b;">Onderwerp:</strong> ${onderwerp}</p>` : ""}
            ${bericht ? `
            <div style="background:#f9fafb;border-left:3px solid #2d6a4f;border-radius:4px;padding:16px 20px;margin:20px 0;color:#4b5563;font-size:14px;line-height:1.6;">
              ${String(bericht).replace(/\n/g, "<br>")}
            </div>` : ""}
            <p style="margin:16px 0 0;">Tot gauw,<br><strong style="color:#071a0b;">${fromName}</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
              Dit is een automatisch bericht — je hoeft hier niet op te antwoorden.<br>
              <span style="color:#2d6a4f;font-weight:600;">Scouting Titus Brandsma · Oldenzaal · Sinds 1945</span>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // ── Notificatiemail naar abonnees ───────────────────────────────────────
    const berichtVelden = [
      onderwerp ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:110px;vertical-align:top;">Onderwerp</td><td style="padding:6px 0;color:#111827;font-size:13px;">${onderwerp}</td></tr>` : "",
      bericht   ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;vertical-align:top;">Bericht</td><td style="padding:6px 0;color:#111827;font-size:13px;line-height:1.6;">${String(bericht).replace(/\n/g, "<br>")}</td></tr>` : "",
    ].join("");

    const notificatieHtml = (ontvanger: string) => `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);max-width:560px;">
        <tr>
          <td style="background:#071a0b;padding:24px 40px;">
            <span style="color:#ffffff;font-size:16px;font-weight:700;">Scouting<span style="color:#c0392b;">.</span></span>
            <span style="color:#ffffff;opacity:0.4;font-size:12px;margin-left:12px;">Nieuw contactbericht</span>
          </td>
        </tr>
        <tr><td style="background:#2d6a4f;height:3px;"></td></tr>
        <tr>
          <td style="padding:32px 40px;color:#374151;font-size:15px;line-height:1.75;">
            <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#071a0b;">Hoi ${ontvanger},</p>
            <p style="margin:0 0 20px;">Er is een nieuw bericht ontvangen via het contactformulier op de website.</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e5e7eb;margin-top:8px;">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:110px;">Van</td><td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;">${naam}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">E-mail</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#2d6a4f;font-size:13px;">${email}</a></td></tr>
              ${berichtVelden}
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 40px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Automatisch gegenereerd · Scouting Titus Brandsma</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Verzamel alle ontvangers: abonnees
    type SubscriberRow = { website_users: { email: string; display_name: string } | null };
    const subscriberEmails: Array<{ email: string; name: string }> = (subscriberRows as SubscriberRow[] ?? [])
      .filter(r => r.website_users?.email)
      .map(r => ({ email: r.website_users!.email, name: r.website_users!.display_name || r.website_users!.email }));

    const sends: Promise<Response>[] = [];

    // Bevestiging naar inzender
    sends.push(fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        subject: "Bedankt voor je bericht — Scouting Titus Brandsma",
        html: bevestigingHtml,
      }),
    }));

    // Notificatie naar alle abonnees
    for (const sub of subscriberEmails) {
      sends.push(fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [sub.email],
          reply_to: email,
          subject: `Nieuw contactbericht van ${naam}`,
          html: notificatieHtml(sub.name),
        }),
      }));
    }

    const results = await Promise.all(sends);
    for (const res of results) {
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend fout: ${err}`);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
