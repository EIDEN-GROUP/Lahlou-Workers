// Uploads the 6 mock project images to Supabase Storage `project-images/seed/`.
// Reads credentials from local `.env` (never prints them).
// Usage: node scripts/upload-seed-images.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const files = {
  "seed/missimi.webp": "src/assets/lahlou-project.webp",
  "seed/r-plus-5.webp": "src/assets/galerie-chantier-aerien.webp",
  "seed/villa.webp": "src/assets/lahlou-team.webp",
  "seed/cimenterie.webp": "src/assets/lahlou-craft.webp",
  "seed/renovation-siege.webp": "src/assets/lahlou-hero.webp",
  "seed/bureaux.webp": "src/assets/service-gros-oeuvre.webp",
};

const { error: bucketError } = await supabase.storage.createBucket("project-images", {
  public: true,
});
if (bucketError && !/exists|duplicate|already/i.test(bucketError.message)) {
  throw bucketError;
}
console.log("bucket: project-images (public)");

for (const [path, local] of Object.entries(files)) {
  const buf = readFileSync(local);
  const { error } = await supabase.storage
    .from("project-images")
    .upload(path, buf, { contentType: "image/webp", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("project-images").getPublicUrl(path);
  console.log(`${path} <- ${local} (${(buf.length / 1024).toFixed(0)}KB)\n  ${data.publicUrl}`);
}
