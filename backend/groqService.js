import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY tidak ditemukan di environment");
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

export async function getCodeReview({ code, language }) {
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `Language: ${language}\n\nCode:\n\`\`\`${language?.toLowerCase?.() || ""}\n${code}\n\`\`\``,
    },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    max_tokens: 4096,
    temperature: 0.3,
    stream: false,
  });

  const fullText = completion?.choices?.[0]?.message?.content || "";
  return fullText;
}
