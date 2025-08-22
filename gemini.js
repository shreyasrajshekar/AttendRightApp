export async function analyzeTimetable(base64Image) {
  const apiKey = "AIzaSyBHjKT7Dsk_sPvBs9zpVjlGjcGseRvD9aA"; 
  const prompt = "Extract this timetable into a JSON structure with subjects, timings, and days.";


  function extractTextFromResponse(data) {
  if (!data) return null;

  try {
    // Normal path
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    // Nested array path
    if (data.candidates?.[0]?.content?.[0]?.parts?.[0]?.text) {
      return data.candidates[0].content[0].parts[0].text;
    }

    // Fallbacks
    if (data.output) return data.output;
    if (data.text) return data.text;

    return null;
  } catch {
    return null;
  }
}

   try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
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
    console.log("API Raw Response:", JSON.stringify(data, null, 2));

    const extracted = extractTextFromResponse(data);
    return extracted || "Could not extract timetable.";
  } catch (err) {
    console.error("Timetable error:", err);
    return "Error extracting timetable.";
  }
}
export async function getAdvice(message) {
  const apiKey = "AIzaSyBHjKT7Dsk_sPvBs9zpVjlGjcGseRvD9aA"; 
  const prompt = `You are a helpful advisor for students. ${message}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("Chat API response:", JSON.stringify(data, null, 2));

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No advice available."
    );
  } catch (err) {
    console.error("Chat error:", err);
    return "Error getting advice.";
  }
}
