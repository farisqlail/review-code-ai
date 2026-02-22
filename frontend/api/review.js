import Groq from "groq-sdk";

// eslint-disable-next-line no-undef
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("Missing GROQ_API_KEY environment variable");
}

const groq = new Groq({ apiKey });

const SYSTEM_PROMPT = `
You are an expert code reviewer with 10+ years of experience.
Review the provided code and give structured feedback in these sections:
1. 🐛 Bugs & Errors
2. ⚡ Performance Issues
3. 🔒 Security Vulnerabilities
4. 📝 Code Quality & Best Practices
5. ✅ Improved Code Example
Be specific, actionable, and explain WHY each issue matters.
Format your response in Markdown.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, language } = req.body || {};

  if (!code || typeof code !== "string") {
    return res.status(400).json({
      error: "Code cannot be empty",
    });
  }

  try {
    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Language: ${language || "unknown"}\n\nCode:\n\`\`\`${language?.toLowerCase?.() || ""}\n${code}\n\`\`\``,
      },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 4096,
      temperature: 0.3,
      stream: false,
    });

    const review = completion?.choices?.[0]?.message?.content || "";

    if (!review || !review.trim()) {
      return res.status(500).json({
        error: "The model did not return any review content",
      });
    }

    return res.status(200).json({ review });
  } catch (err) {
    console.error("Error in /api/review (Vercel):", err);
    return res.status(500).json({
      error: "An error occurred while processing the code review",
    });
  }
}
