const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/generate-quiz', async (req, res) => {
  const { paragraph } = req.body;

  console.log(" Incoming request to /generate-quiz");
  console.log(" Paragraph:", paragraph);

  const prompt = `
Generate exactly 1 critical thinking multiple choice question from the following paragraph:

"${paragraph}"

Respond strictly in this JSON format:
\`\`\`json
{
  "question": "Your question text here",
  "options": [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ],
  "correctAnswerIndex": 0
}
\`\`\`

Do not add any text or explanation outside the JSON. Only return the valid JSON object wrapped in triple backticks as shown.
All strings must be double quoted. Make sure every array element ends with a comma except the last one.
`;

  const maxAttempts = 5;
  let attempt = 0;
  let parsed = null;
  let raw = '';

  while (attempt < maxAttempts) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5
        },
        {
          headers: {
            Authorization: 'Bearer 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',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'CurtinTalentTrack AI Quiz Gen'
          },
          timeout: 120000
        }
      );

      raw = response.data.choices[0].message.content || '';
      console.log(`Attempt ${attempt + 1} - Raw response:\n`, raw);

      // Remove unwanted characters (e.g. triple backticks if LLM wraps output)
      const jsonClean = raw.replace(/```(?:json)?|```/g, '').trim();
      parsed = JSON.parse(jsonClean);

      // Validate structure
      if (
        parsed &&
        typeof parsed.question === 'string' &&
        Array.isArray(parsed.options) &&
        parsed.options.length === 4 &&
        typeof parsed.correctAnswerIndex === 'number' &&
        parsed.correctAnswerIndex >= 0 &&
        parsed.correctAnswerIndex < 4
      ) {
        const question = parsed.question.trim();
        const options = parsed.options.map(opt => opt.trim());
        const answer = options[parsed.correctAnswerIndex];

        const result = [{ question, options, answer }];
        console.log("✅ Parsed question:", result);
        return res.status(200).json({ questions: result });
      }

      throw new Error(" JSON structure invalid");

    } catch (err) {
      console.warn(`Attempt ${attempt + 1} failed:`, err.message || err);
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second before retry
    }
  }

  // Final failure after retries
  console.error(' Final failure: Could not generate valid quiz');
  res.status(500).json({ error: 'Failed to generate quiz from OpenRouter' });
});

module.exports = router;
