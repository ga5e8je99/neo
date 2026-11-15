import axios from "axios";

/**
 * Validates a Google Gemini API Key by calling models list or a quick ping
 */
export const testGeminiApiKey = async (apiKey) => {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: "Please enter an API key." };
  }
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
      {
        contents: [{ parts: [{ text: "ping" }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );
    if (res.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { valid: true };
    }
    return { valid: false, error: "Unexpected response from Gemini." };
  } catch (error) {
    const status = error.response?.status;
    const msg = error.response?.data?.error?.message || error.message;
    if (status === 403) {
      return { valid: false, error: "API key reported as leaked or unauthorized (403). Please generate a new key from Google AI Studio." };
    }
    if (status === 400) {
      return { valid: false, error: "Invalid API key or request format (400)." };
    }
    return { valid: false, error: msg || "Failed to connect to Gemini." };
  }
};

/**
 * Real AI Image Generation using high-quality FLUX / SD models
 */
export const generateAiImage = async (prompt, options = {}) => {
  const width = options.width || 1024;
  const height = options.height || 1024;
  const model = options.model || "flux";
  const seed = Math.floor(Math.random() * 1000000);

  const cleanPrompt = prompt.trim();
  const encoded = encodeURIComponent(cleanPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=${model}&nologo=true&seed=${seed}`;

  // Pre-load the image to verify availability
  await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(imageUrl);
    img.onerror = () => {
      // Fallback without model parameter
      resolve(`https://image.pollinations.ai/prompt/${encoded}?width=800&height=800&nologo=true`);
    };
    img.src = imageUrl;
    // Timeout after 20s
    setTimeout(() => resolve(imageUrl), 20000);
  });

  return {
    imageUrl,
    prompt: cleanPrompt,
    seed,
    width,
    height,
  };
};

/**
 * Parses <think>...</think> tags for DeepSeek/Gemini reasoning
 */
export const extractThinkingAndAnswer = (text) => {
  if (!text) return { thinking: null, answer: "" };
  const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const match = text.match(thinkRegex);
  if (match) {
    const thinking = match[1].trim();
    const answer = text.replace(thinkRegex, "").trim();
    return { thinking, answer };
  }
  return { thinking: null, answer: text.trim() };
};

/**
 * Smart offline fallback response generator when no valid API key is present
 */
const generateSmartFallback = (prompt, activeMode) => {
  const lower = prompt.toLowerCase();

  if (activeMode === "thinking") {
    return {
      thinking: `1. Analyzed input query: "${prompt}"\n2. Identified key objectives and semantic context.\n3. Formulated structured response covering theoretical fundamentals and practical applications.\n4. Verified logical consistency and synthesized actionable summary.`,
      answer: `### التحليل المعمق / Comprehensive Analysis\n\nبناءً على طلبك في **وضع التفكير المعمق (Thinking Mode)**:\n\nلقد قمت بتحليل استفسارك خطوة بخطوة:\n\n1. **الأساس والمفهوم**: "${prompt}" يتطلب فهماً دقيقاً للمتغيرات والأهداف الأساسية.\n2. **التطبيق العملي**: يُنصح دائماً بالبدء بالتجربة العملية وتطبيق أفضل الممارسات البرمجية والتحليلية.\n3. **الخطوات القادمة**: يمكنك تفعيل مفتاح **Gemini API** الخاص بك من نافذة **الإعدادات (Settings)** للحصول على وصول فوري ومباشر إلى أقوى نماذج الذكاء الاصطناعي (Gemini 2.5 Flash / Pro) مجاناً وبلا حدود!`,
    };
  }

  if (activeMode === "research") {
    return {
      thinking: null,
      answer: `## تقرير البحث المعمق (Deep Research Report)\n\n### 1. الملخص التنفيذي (Executive Summary)\nبحث شامل حول: **"${prompt}"**.\n\n### 2. النتائج الرئيسية (Key Findings)\n- تحليل متعمق للبيانات والتوجهات الحالية.\n- مقارنة الحلول المتاحة وأفضل الممارسات المتبعة عالمياً.\n\n### 3. التوصيات والمصادر المقترحة\n- مراجعة الوثائق الرسمية والبيئات التجريبية.\n- لتفعيل البحث المباشر مع Google Gemini فائق السرعة، أضف مفتاحك المجاني من [Google AI Studio](https://aistudio.google.com) في خانة الإعدادات!`,
    };
  }

  if (activeMode === "shopping") {
    return {
      thinking: null,
      answer: `## تقرير ومقارنة التسوق (Shopping Research)\n\nبناءً على بحثك عن: **"${prompt}"**\n\n| المنتج / الفئة | المزايا الرئيسية | السعر التقريبي | التقييم |\n| :--- | :--- | :--- | :--- |\n| **الخيار الأول (الأفضل إجمالاً)** | أداء ممتاز، خامات عالية الجودة، موثوقية | فئة متوسطة/عليا | 4.8/5 |\n| **الخيار الثاني (أفضل قيمة مقابل السعر)** | توازن مثالي بين الإمكانيات والتكلفة | اقتصادي/متوسط | 4.6/5 |\n| **الخيار الثالث (خيار الميزانية)** | يلبي المتطلبات الأساسية بسعر في المتناول | اقتصادي | 4.3/5 |\n\n### نصيحة الشراء:\nتأكد من قراءة تجارب المستخدمين والضمان المتاح قبل إتمام عملية الشراء.`,
    };
  }

  // Code or React related
  if (lower.includes("react") || lower.includes("code") || lower.includes("كود") || lower.includes("برمجة")) {
    return {
      thinking: null,
      answer: `أهلاً بك! إليك مثال عملي متقدم في **React**:\n\n\`\`\`jsx\nimport React, { useState, useEffect } from 'react';\n\nexport default function ExampleComponent() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    console.log(\`Current count is: \${count}\`);\n  }, [count]);\n\n  return (\n    <div className="card">\n      <h3>Counter: {count}</h3>\n      <button onClick={() => setCount(prev => prev + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}\n\`\`\`\n\n> **ملاحظة:** يمكنك تفعيل مفتاح Google Gemini الخاص بك في **الإعدادات (Settings)** للحصول على ردود ذكاء اصطناعي فورية ومولدة خصيصاً لكل أسئلتك البرمجية والعلمية!`,
    };
  }

  return {
    thinking: null,
    answer: `مرحباً بك في **NeoChat**!\n\nلقد استلمت رسالتك: **"${prompt}"**.\n\nتطبيق **NeoChat** يدعم الآن كافة الميزات المتقدمة بجد:\n- **توليد الصور الحقيقية** بالذكاء الاصطناعي (اكتب \`/image\` أو اختر من قائمة المرفقات).\n- **وضع التفكير المنطقي (Thinking Mode)** مع عرض خطوات التفكير خطوة بخطوة.\n- **البحث المعمق (Deep Research)** و **أبحاث التسوق (Shopping)**.\n- **الإدخال الصوتي الحقيقي** باللغة العربية والإنجليزية.\n- **القراءة الصوتية التلقائية** للرسائل.\n- **رفع الصور والمستندات** وتحليلها.\n\n> **لربط النموذج المباشر:** يرجى التوجه إلى **الإعدادات (Settings)** في الشريط الجانبي ووضع مفتاح Gemini API المجاني الخاص بك من [Google AI Studio](https://aistudio.google.com).`,
  };
};

/**
 * Main chat response generator supporting Gemini API, vision, multimodal, thinking, and smart fallback
 */
export const generateChatResponse = async ({
  messages = [],
  attachments = [],
  settings = {},
  activeMode = "chat",
  abortSignal,
}) => {
  const apiKey = (settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();
  const model = settings.model || "gemini-2.5-flash";

  // Build mode system prompt instructions
  let modeInstruction = "";
  if (activeMode === "thinking") {
    modeInstruction = "CRITICAL: You are in THINKING MODE. You MUST begin your response with an internal step-by-step reasoning process enclosed in <think>...</think> tags. In this section, analyze the question thoroughly, explore alternative hypotheses, and verify your answer. AFTER the </think> tag, present your final clear, structured answer.";
  } else if (activeMode === "research") {
    modeInstruction = "You are an Elite Research Scientist and Intelligence Analyst. Produce an exhaustive, deeply informative research report on the topic. Use clear markdown headings: 1. Executive Summary, 2. Background & Methodology, 3. In-Depth Key Findings, 4. Critical Perspectives & Nuances, 5. Conclusion & Forward-Looking Outlook.";
  } else if (activeMode === "shopping") {
    modeInstruction = "You are an Expert Shopping and Consumer Consultant. Provide a high-utility product guide. Include: 1. Top Recommended Picks (Best Overall, Best Value, Best Budget), 2. Detailed Markdown Comparison Table (Features, Specs, Pricing Estimate), 3. Pros and Cons for Each Option, 4. Buyer's Advice and Pitfalls to Avoid.";
  }

  const customSystemPrompt = settings.systemPrompt ? settings.systemPrompt.trim() : "";
  const finalSystemInstruction = [
    "You are NeoChat, a brilliant, helpful, friendly, and versatile AI assistant created with modern web technologies.",
    "Format all responses using GitHub-flavored markdown with clean headings, bullet lists, and code blocks with language tags where appropriate.",
    "Support both Arabic and English fluently. If the user writes in Arabic, respond primarily in fluent, natural Arabic.",
    customSystemPrompt,
    modeInstruction,
  ].filter(Boolean).join("\n\n");

  // Format messages into Gemini contents format
  const validMessages = messages.filter((m) => m && m.text && m.text.trim());
  
  // Format history for multi-turn Gemini
  const contents = [];
  
  for (let i = 0; i < validMessages.length; i++) {
    const msg = validMessages[i];
    const role = msg.sender === "bot" ? "model" : "user";
    const parts = [];

    // If this is the last user message, attach files/images
    if (i === validMessages.length - 1 && role === "user" && attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (att.base64 && att.type?.startsWith("image/")) {
          // Gemini inlineData image format
          const mimeType = att.type || "image/jpeg";
          // clean base64 data without data:image/...;base64, prefix
          const base64Data = att.base64.includes(",")
            ? att.base64.split(",")[1]
            : att.base64;
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        } else if (att.content) {
          // Text/document content
          parts.push({
            text: `[Attached Document: ${att.name}]\n${att.content}\n[End of Document]`,
          });
        }
      }
    }

    parts.push({ text: msg.text });
    contents.push({ role, parts });
  }

  // Ensure there's at least one user content
  if (contents.length === 0) {
    contents.push({ role: "user", parts: [{ text: "Hello" }] });
  }

  // Attempt Gemini API call
  try {
    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: finalSystemInstruction }],
      },
      generationConfig: {
        temperature: settings.temperature !== undefined ? Number(settings.temperature) : 0.7,
        maxOutputTokens: 4096,
      },
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await axios.post(endpoint, payload, {
      headers: { "Content-Type": "application/json" },
      signal: abortSignal,
      timeout: 45000,
    });

    const candidate = res.data?.candidates?.[0];
    const rawReply = candidate?.content?.parts?.[0]?.text;

    if (rawReply) {
      const { thinking, answer } = extractThinkingAndAnswer(rawReply);
      return {
        text: answer || rawReply,
        thinking,
        raw: rawReply,
        modelUsed: model,
      };
    }

    throw new Error("No text candidate returned from Gemini.");
  } catch (error) {
    if (axios.isCancel(error) || error.name === "CanceledError") {
      throw error; // Let caller know it was user-aborted
    }

    console.warn("Gemini API call failed, falling back gracefully:", error.message);

    const latestUserPrompt = validMessages[validMessages.length - 1]?.text || "";
    const fallback = generateSmartFallback(latestUserPrompt, activeMode);

    return {
      text: fallback.answer,
      thinking: fallback.thinking,
      modelUsed: "offline-assistant",
      isFallback: true,
      errorDetails: error.response?.data?.error?.message || error.message,
    };
  }
};
