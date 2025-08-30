import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// ----------------------
// 1) TIMETABLE UPLOAD
// ----------------------
app.post("/api/timetable", async (req, res) => {
  try {
    const { clientId, base64Image } = req.body;
    if (!clientId || !base64Image)
      return res.status(400).json({ error: "clientId and base64Image required" });

    // Call Gemini (ask for BOTH json + explanation)
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
                  text: `Extract this timetable. 
1) Return machine-readable JSON in this format:
{ "days": { "Monday": ["9-10 Math", "10-11 Physics"], ... } }
2) Also return a short student-friendly explanation.
Output must be two parts separated clearly with:
---JSON---
...json...
---EXPLANATION---
...text...
`
                },
                { inline_data: { mime_type: "image/png", data: base64Image } },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Split JSON + explanation
    let timetableJson = {};
    let explanation = "Could not extract timetable.";

    if (raw.includes("---JSON---")) {
      const parts = raw.split("---EXPLANATION---");
      const jsonPart = parts[0].replace("---JSON---", "").trim();
      explanation = parts[1]?.trim() || explanation;

      try {
        timetableJson = JSON.parse(jsonPart);
      } catch (e) {
        console.error("JSON parse error:", e);
      }
    }

    // Save in Supabase
    const { error: insertError } = await supabase.from("timetables").insert([
      {
        user_id: clientId,
        timetable: timetableJson,
        analyzed_text: explanation,
      },
    ]);
    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(500).json({ error: "Supabase insert failed" });
    }

    res.json({ timetable: timetableJson, explanation });
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ result: "Error analyzing timetable." });
  }
});

// ----------------------
// 2) ATTENDANCE UPLOAD
// ----------------------
app.post("/api/attendance", async (req, res) => {
  try {
    const { clientId, attendanceData } = req.body;
    if (!clientId || !attendanceData)
      return res.status(400).json({ error: "clientId and attendanceData required" });

    // attendanceData should be an array of objects
    // [
    //   { Subject: "Math", Total: 40, Present: 36, "Percentage %": "90" },
    //   ...
    // ]

    const { error: insertError } = await supabase.from("attendance").insert([
      {
        user_id: clientId,
        attendance_data: attendanceData,
      },
    ]);
    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(500).json({ error: "Supabase insert failed" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ result: "Error uploading attendance." });
  }
});

// ----------------------
// 3) CHAT WITH CONTEXT
// ----------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { clientId, message } = req.body;
    if (!clientId || !message)
      return res.status(400).json({ error: "clientId and message required" });

    // fetch latest timetable
    const { data: tt, error: ttErr } = await supabase
      .from("timetables")
      .select("timetable, analyzed_text, created_at")
      .eq("user_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (ttErr) console.error("Supabase timetable fetch error:", ttErr);

    // fetch latest attendance
    const { data: attRows, error: attErr } = await supabase
      .from("attendance")
      .select("attendance_data, created_at")
      .eq("user_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (attErr) console.error("Supabase attendance fetch error:", attErr);

    let attendanceText = "";
    if (attRows && attRows.length > 0) {
      const attData = attRows[0].attendance_data;
      if (Array.isArray(attData)) {
        attendanceText = attData
          .map((a) => {
            const T = a.Total || 0;
            const A = a.Present || 0;
            const p = a["Percentage %"] || "N/A";
            return `${a.Subject}: ${A}/${T} (${p}%)`;
          })
          .join("\n");
      }
    }

    const timetableText =
      tt?.[0]?.analyzed_text || "(no timetable found)";

    // prompt
    const system = `You are a student advisor. Use the timetable and attendance to give personalized advice.
- If asked "what can I miss", compute: bunkable = floor(max(0, (A / (p/100)) - T)).
- If asked "how to reach X%", compute: need = ceil(p*T - A).
Be concise and friendly.`;

    const userMsg = `User message: ${message}

Timetable:
${timetableText}

Attendance:
${attendanceText}
`;

    // call Gemini
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

app.listen(5000, () => console.log("Server running on port 5000"));