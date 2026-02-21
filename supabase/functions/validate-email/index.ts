import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email) return new Response(JSON.stringify({ allowed: false, error: "Email required" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data } = await supabase
      .from("allowed_emails")
      .select("id, hostel_id, role, hostels(name, code)")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (!data) {
      return new Response(JSON.stringify({ allowed: false, error: "This email is not pre-approved. Contact your hostel administration." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ allowed: true, hostel: data.hostels, role: data.role }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ allowed: false, error: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
