import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://enkqruajxnolwpuxosfg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVua3FydWFqeG5vbHdwdXhvc2ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEyNTM1NywiZXhwIjoyMDczNzAxMzU3fQ.r7_VMrIvFX2LQo-pxtp-bKK39vPdASvaRR4E9WeVd4o"; // Supabasedan oling, maxfiy!

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Faqat POST so‘rovi ishlaydi bratishka!" });
  }

  const {
    avatar_url,
    login,
    password,
    role,
    first_name,
    last_name,
    middle_name,
    birth_date,
    gender,
    phone,
    passport_serial,
    position,
  } = req.body;

  const email = `${login}@124maktab.uz`;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Supabase Authda yangi user yaratamiz
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { login, role },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Profiles table’ga qo‘shamiz
  const user_id = data.user.id;
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: user_id,
      login,
      role,
      email,
      first_name,
      last_name,
      middle_name,
      birth_date,
      gender,
      phone,
      passport_serial,
      position,
      password,
      avatar_url
    },
  ]);

  if (profileError) {
    return res.status(400).json({ error: profileError.message });
  }

  return res
    .status(200)
    .json({ success: true, message: "Yangi user yaratildi!" });
}


