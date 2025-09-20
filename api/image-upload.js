import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";
const SUPABASE_URL = "https://enkqruajxnolwpuxosfg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVua3FydWFqeG5vbHdwdXhvc2ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEyNTM1NywiZXhwIjoyMDczNzAxMzU3fQ.r7_VMrIvFX2LQo-pxtp-bKK39vPdASvaRR4E9WeVd4o"; // Supabasedan oling, maxfiy!

const supabase = createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY // ⚠️ Faqat backendda!);

export const config = {
  api: {
    bodyParser: false, // FormData uchun kerak
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Faqat POST ishlaydi" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: "Form parsing error" });

    const file = files.file; // formData'dagi "file" nomli input
    if (!file) return res.status(400).json({ error: "Fayl yo‘q" });

    const ext = file.originalFilename.split(".").pop();
    const path = `avatars/${Date.now()}.${ext}`;
    const fileData = fs.readFileSync(file.filepath);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, fileData, { contentType: file.mimetype, upsert: true });

    if (uploadError) return res.status(400).json({ error: uploadError.message });

    // public URL qaytarish
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);

    return res.status(200).json({ url: data.publicUrl });
  });
}
