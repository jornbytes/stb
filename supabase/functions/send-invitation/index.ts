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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { submissionId, naam, email, speltak, subject, bodyHtml } = await req.json();

    if (!submissionId || !naam || !email) {
      return new Response(JSON.stringify({ error: "Ontbrekende velden" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailSubject = subject ?? `Uitnodiging scouting${speltak ? ` bij de ${speltak}` : ""}`;
    const emailBody = bodyHtml ?? `<p>Hoi ${naam},</p><p>Leuk dat je wil komen kijken!</p>`;

    const emailHtml = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:#2d6a4f;padding:28px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Scouting</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;color:#374151;font-size:15px;line-height:1.7;">
            ${emailBody}
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 40px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Dit is een automatisch bericht van de scouting website.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Scouting <noreply@${Deno.env.get("RESEND_DOMAIN") ?? "resend.dev"}>`,
          to: [email],
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend fout: ${err}`);
      }
    } else {
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { naam, speltak },
      });
      if (inviteError && !inviteError.message.includes("already been registered")) {
        console.warn("Invite error (non-fatal):", inviteError.message);
      }
    }

    const { error: updateError } = await supabase
      .from("membership_requests")
      .update({ behandeld: true })
      .eq("id", submissionId);

    if (updateError) throw updateError;

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
