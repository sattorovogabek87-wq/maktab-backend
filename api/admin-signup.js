import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://enkqruajxnolwpuxosfg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVua3FydWFqeG5vbHdwdXhvc2ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEyNTM1NywiZXhwIjoyMDczNzAxMzU3fQ.r7_VMrIvFX2LQo-pxtp-bKK39vPdASvaRR4E9WeVd4o"; // Maxfiy!

export const config = {
  api: {
    bodyParser: false, // FormData uchun
  },
};

import formidable from "formidable";
import fs from "fs";

export default async function handler(req, res) {
  // CORS ruxsat berish
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Faqat POST so‘rovi ishlaydi bratishka!" });
  }

  // FormData parse qilamiz
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Form parsing error" });
    }

    const {
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
      location,
      position,
      email,
    } = fields;

    const email_signup = `${login}@124maktab.uz`;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let avatar_url = "";
    // 1. Rasmni Supabase Storage'ga yuklaymiz
    if(!files){
      return res.status(404).json({ error: "files topilmadi bratishka:" + files});
    }
    return res.status(400).json({ error: "photo mana kor bratishka: " + files.photo});
    
    if(!files.photo){
      avatar_url = null;
    }else{
    if (files.photo) {
      const photo = files.photo;
      const photoExt = photo.originalFilename.split('.').pop();
      const photoFileName = `avatars/${Date.now()}_${login}.${photoExt}`;
      const photoData = fs.readFileSync(photo.filepath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(photoFileName, photoData, {
          contentType: photo.mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res.status(400).json({ error: "Rasm yuklashda xato: " + uploadError.message });
      }

      avatar_url = `${SUPABASE_URL}/storage/v1/object/public/avatars/${photoFileName}`;
    }else{
      avatar_url = null;
    }
    } 

    // 2. Supabase Auth’da user yaratamiz
    const { data, error } = await supabase.auth.admin.createUser({
      email:email_signup,
      password,
      email_confirm: true,
      user_metadata: { login, role },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // 3. Profiles jadvaliga yozamiz
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
        phone:`+998${phone}`,
        passport_serial,
        location,
        position,
        password,
        avatar_url,
      },
    ]);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({
      success: true,
      message: "Yangi Hodim yaratildi!",
      avatar_url,
    });
  });
}
















