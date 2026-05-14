// api/generate.js
const GEMINI_API_KEY = 'AIzaSyAUOv7YIVd0Dh72-KJDoY2k4xSW8PNmYnA';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const structuredPrompt = `Extract billing details from this request as JSON. Format: {"businessName":"","clientName":"","clientEmail":"","items":[{"name":"","quantity":1,"rate":0}],"extraCharges":[{"name":"","amount":0}],"discountPercentage":0,"discountLabel":"","notes":"","currency":"Rs"}. Calculate subtotal, extra total, discount amount, grand total. Request: "${prompt}"`;

    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: structuredPrompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    });

    const data = await geminiResponse.json();
    let generatedText = data.candidates[0].content.parts[0].text;
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```/g, '').trim();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(JSON.parse(generatedText));
  } catch (error) {
    console.error('Gemini API error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
}
