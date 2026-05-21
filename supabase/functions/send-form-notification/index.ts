import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type FormType = "meekijken" | "membership";

const FORM_LABELS: Record<FormType, string> = {
  meekijken: "Meekijken aanmelding",
  membership: "Lid worden aanmelding",
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

    const body = await req.json();
    const { formType, fields } = body as { formType: FormType; fields: Record<string, string> };

    if (!formType || !fields) {
      return new Response(JSON.stringify({ error: "Ontbrekende velden" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ success: true, skipped: "no_resend_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Haal afzenderinstellingen en subscribers op
    const [{ data: settingsRows }, { data: subscriberRows }] = await Promise.all([
      supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["mail_from_name", "mail_from_email"]),
      supabase
        .from("form_notification_subscribers")
        .select("website_users(email, display_name)")
        .eq("form_type", formType),
    ]);

    const settings: Record<string, string> = {};
    (settingsRows ?? []).forEach((r: { key: string; value: string }) => {
      settings[r.key] = r.value;
    });

    const fromName  = settings.mail_from_name  || "Scouting Titus Brandsma";
    const fromEmail = settings.mail_from_email || `noreply@${Deno.env.get("RESEND_DOMAIN") ?? "resend.dev"}`;

    type SubscriberRow = { website_users: { email: string; display_name: string } | null };
    const subscribers: Array<{ email: string; name: string }> = (subscriberRows as SubscriberRow[] ?? [])
      .filter(r => r.website_users?.email)
      .map(r => ({ email: r.website_users!.email, name: r.website_users!.display_name || r.website_users!.email }));

    if (subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, skipped: "no_subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const label = FORM_LABELS[formType] ?? formType;
    const naam  = fields.naam || fields.name || "Onbekend";
    const email = fields.email || "";

    // Bouw een overzichtstabel van alle veldwaarden
    const veldLabels: Record<string, string> = {
      naam: "Naam", name: "Naam", email: "E-mail", telefoon: "Telefoon",
      leeftijd: "Leeftijd", speltak: "Speltak", geboortedatum: "Geboortedatum",
      opmerking: "Opmerking",
    };

    const veldenHtml = Object.entries(fields)
      .filter(([, v]) => v)
      .map(([k, v]) => {
        const lbl = veldLabels[k] ?? (k.charAt(0).toUpperCase() + k.slice(1));
        const val = k === "email"
          ? `<a href="mailto:${v}" style="color:#2d6a4f;">${v}</a>`
          : k === "telefoon"
          ? `<a href="tel:${v}" style="color:#2d6a4f;">${v}</a>`
          : v;
        return `<tr>
          <td style="padding:6px 0;color:#6b7280;font-size:13px;width:130px;vertical-align:top;">${lbl}</td>
          <td style="padding:6px 0;color:#111827;font-size:13px;line-height:1.5;">${val}</td>
        </tr>`;
      }).join("");

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
            <span style="color:#ffffff;opacity:0.4;font-size:12px;margin-left:12px;">Nieuwe ${label.toLowerCase()}</span>
          </td>
        </tr>
        <tr><td style="background:#2d6a4f;height:3px;"></td></tr>
        <tr>
          <td style="padding:32px 40px;color:#374151;font-size:15px;line-height:1.75;">
            <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#071a0b;">Hoi ${ontvanger},</p>
            <p style="margin:0 0 20px;">Er is een nieuwe <strong>${label.toLowerCase()}</strong> binnengekomen via de website.</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e5e7eb;">
              ${veldenHtml}
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

    const sends = subscribers.map(sub =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [sub.email],
          ...(email ? { reply_to: email } : {}),
          subject: `Nieuwe ${label.toLowerCase()} van ${naam}`,
          html: notificatieHtml(sub.name),
        }),
      })
    );

    const results = await Promise.all(sends);
    for (const res of results) {
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend fout: ${err}`);
      }
    }

    return new Response(JSON.stringify({ success: true, sent: subscribers.length }), {
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
