// pages/api/delete-user.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://enkqruajxnolwpuxosfg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVua3FydWFqeG5vbHdwdXhvc2ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEyNTM1NywiZXhwIjoyMDczNzAxMzU3fQ.r7_VMrIvFX2LQo-pxtp-bKK39vPdASvaRR4E9WeVd4o";

export default async function handler(req, res) {
  // 🔧 CORS qo'shamiz
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Faqat POST ishlaydi!" });
  }

  try {
    const { user_id } = req.body; // frontenddan user_id keladi

    if (!user_id) {
      return res.status(400).json({ error: "user_id yuborilmadi!" });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);


    // 2. Profiles jadvalidan o‘chiramiz
    const { error: dbError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user_id);

    if (dbError) {
      return res.status(400).json({ error: "Profiles o‘chirish xatosi: " + dbError.message });
    }

     // 1. Auth dan foydalanuvchini o‘chiramiz
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id);
    if (authError) {
      return res.status(400).json({ error: "Auth o‘chirish xatosi: " + authError.message });
    }

    return res.status(200).json({ success: true, message: "Hodim muvaffaqiyatli o‘chirildi!" });
  } catch (err) {
    return res.status(500).json({ error: "Server xatosi: " + err.message });
  }
}
