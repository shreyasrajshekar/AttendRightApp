import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/analyse-timetable", upload.single("timetable"), async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const imageBuffer = req.file;

    // Convert to Base64
    const base64Image = Buffer.from(
      require("fs").readFileSync(imageBuffer.path)
    ).toString("base64");

    // Send to Gemini
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Extract the timetable from this image and return JSON with days as keys and subjects as arrays." },
                { inlineData: { mimeType: "image/jpeg", data: base64Image } }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
