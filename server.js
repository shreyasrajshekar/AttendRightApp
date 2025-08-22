// server.js
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

// Import dotenv at the very top to ensure it loads before any variables are used
import dotenv from "dotenv";
dotenv.config();

// Supabase client and service role key
// Use the 'createClient' function from the Supabase library
import { createClient } from "@supabase/supabase-js";

// Supabase (admin, service role key)
// This is the line that was throwing the error, now it uses the correct env variable name
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// If you want to use the public key for some operations, you can create a second client.
// const supabasePublic = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));


// ----------------------
// 1) TIMETABLE UPLOAD
// ----------------------
app.post("/api/timetable", async (req, res) => {
  try {
    const { clientId, base64Image } = req.body;
    if (!clientId || !base64Image)
      return res.status(400).json({ error: "clientId and base64Image required" });

    // Call Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Extract this timetable clearly and return a **student-friendly explanation of the schedule** (not JSON).",
                },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini raw:", data);

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Could not extract timetable.";

    // Save in Supabase
    const { error: insertError } = await supabase.from("timetables").insert([
      {
        user_id: clientId,
        timetable: {}, // optionally raw data if parsed later
        analyzed_text: text,
      },
    ]);
    if (insertError) {
      console.error("Supabase insert error:", insertError);
    }

    res.json({ result: text });
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ result: "Error analyzing timetable." });
  }
});

// ----------------------
// 2) CHAT WITH CONTEXT
// ----------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { clientId, message } = req.body;
    if (!clientId || !message)
      return res.status(400).json({ error: "clientId and message required" });

    // 1) fetch latest timetable
    const { data: tt } = await supabase
      .from("timetables")
      .select("timetable, analyzed_text, created_at")
      .eq("user_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1);

    // 2) fetch attendance
    const { data: att } = await supabase
      .from("attendance")
      .select(
        "course_code, course_name, total_classes, attended_classes, min_required_percent"
      )
      .eq("user_id", clientId);

    const timetableText =
      tt?.[0]?.analyzed_text ||
      JSON.stringify(tt?.[0]?.timetable || {}, null, 2);
    const attendanceText = (att || [])
      .map((a) => {
        const T = a.total_classes || 0;
        const A = a.attended_classes || 0;
        const p = a.min_required_percent || 75;
        return `${a.course_code}${
          a.course_name ? ` (${a.course_name})` : ""
        }: ${A}/${T} at ${p}% target`;
      })
      .join("\n");

    // 3) build prompt
    const system = `You are a student advisor. Use the user's timetable and attendance to give personalized, actionable advice. 
- If asked "what can I miss", compute using: bunkable = floor(max(0, (A / (p/100)) - T)). 
- If asked "how to reach X%", compute minimum classes needed next: need = ceil(p*T - A). 
- Be concise and friendly.`;

    const userMsg = `User message: ${message}

Latest timetable:
${timetableText || "(no timetable found)"}

Attendance:
${attendanceText || "(no attendance found)"}
`;

    // 4) call Gemini
    const gRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${system}\n\n${userMsg}` }] }],
        }),
      }
    );
    const gData = await gRes.json();
    const text =
      gData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate advice.";

    res.json({ reply: text });
  } catch (e) {
    console.error("Chat error:", e);
    res.status(500).json({ error: "chat error" });
  }
});

// ----------------------
app.listen(5000, () => console.log("Server running on port 5000"));