import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // FormData uchun
  },
};

const SUPABASE_URL = "https://enkqruajxnolwpuxosfg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "SERVICE_ROLE_KEY"; // maxfiy bo'lishi kerak

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  // 🔓 CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Faqat POST ishlaydi" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: "Form parsing xato" });

    try {
      const {
        user_id, // ⚡️ Frontenddan yuborilishi kerak
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
        avatar_url,
      } = fields;

      if (!user_id) {
        return res.status(400).json({ error: "user_id kerak!" });
      }

      const email = `${login}@124maktab.uz`;
/*
      // 📷 Rasm yuklash
      let avatar_url = null;
      if (files.photo) {
        const photo = files.photo;
        const ext = photo.originalFilename.split(".").pop();
        const fileName = `avatars/${Date.now()}_${login}.${ext}`;
        const fileData = fs.readFileSync(photo.filepath);

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, fileData, {
            contentType: photo.mimetype,
            upsert: true,
          });

        if (uploadError) {
          return res
            .status(400)
            .json({ error: "Rasm yuklashda xato: " + uploadError.message });
        }

        avatar_url = `${SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`;
      }*/

      // 🔑 Auth user yangilash
      const { data: updatedUser, error: updateError } =
        await supabase.auth.admin.updateUserById(user_id, {
          email,
          password,
          email_confirm: true,
          user_metadata: { login, role },
        });

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      // 📄 Profiles jadvalini yangilash
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
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
          avatar_url,
        })
        .eq("id", user_id);

      if (profileError) {
        return res.status(400).json({ error: profileError.message });
      }

      return res.status(200).json({
        success: true,
        message: "Hodim yangilandi!",
        avatar_url,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}
