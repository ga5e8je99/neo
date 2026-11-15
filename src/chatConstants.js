export const ACTIONS = {
  START_NEW_CHAT: "START_NEW_CHAT",
  SEND_MESSAGE: "SEND_MESSAGE",
  UPDATE_MESSAGE: "UPDATE_MESSAGE",
  DELETE_MESSAGE: "DELETE_MESSAGE",
  LOAD_CHAT: "LOAD_CHAT",
  DELETE_CHAT: "DELETE_CHAT",
  CLEAR_ALL_CHATS: "CLEAR_ALL_CHATS",
  RENAME_CHAT: "RENAME_CHAT",
  PIN_CHAT: "PIN_CHAT",
  SET_LOADING: "SET_LOADING",
  SET_INPUT: "SET_INPUT",
  SET_OPEN: "SET_OPEN",
  TOGGLE_THEME: "TOGGLE_THEME",
  SET_THEME: "SET_THEME",
  SET_RECORDING: "SET_RECORDING",
  UPDATE_RECORDING_TIME: "UPDATE_RECORDING_TIME",
  SET_ACTIVE_MODE: "SET_ACTIVE_MODE", // 'chat' | 'image' | 'thinking' | 'research' | 'shopping'
  SET_ATTACHMENTS: "SET_ATTACHMENTS",
  ADD_ATTACHMENT: "ADD_ATTACHMENT",
  REMOVE_ATTACHMENT: "REMOVE_ATTACHMENT",
  CLEAR_ATTACHMENTS: "CLEAR_ATTACHMENTS",
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
  SET_SETTINGS_OPEN: "SET_SETTINGS_OPEN",
  SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
  INIT_STATE: "INIT_STATE",
  REGENERATE_MESSAGE: "REGENERATE_MESSAGE",
  LIKE_MESSAGE: "LIKE_MESSAGE",
};

const getInitialGeminiKey = () => {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("neoGeminiApiKey");
  if (stored && stored !== "AIzaSyAvwpIqHyHv74Ok248qoqRcK5a6UHPO9XM" && stored.trim() !== "") {
    return stored;
  }
  return import.meta.env.VITE_GEMINI_API_KEY || "";
};

export const initialSettings = {
  geminiApiKey: getInitialGeminiKey(),
  hfApiKey: typeof window !== "undefined" ? localStorage.getItem("neoHfApiKey") || import.meta.env.VITE_HUGGINGFACE_API_KEY || "" : "",
  model: typeof window !== "undefined" ? localStorage.getItem("neoModel") || "gemini-2.5-flash" : "gemini-2.5-flash",
  systemPrompt: typeof window !== "undefined" ? localStorage.getItem("neoSystemPrompt") || "" : "",
  temperature: typeof window !== "undefined" && localStorage.getItem("neoTemperature") ? Number(localStorage.getItem("neoTemperature")) : 0.7,
  soundEnabled: typeof window !== "undefined" ? localStorage.getItem("neoSoundEnabled") !== "false" : true,
  speechLang: typeof window !== "undefined" ? localStorage.getItem("neoSpeechLang") || "auto" : "auto",
};

export const initialState = {
  messages: [],
  input: "",
  loading: false,
  open: false,
  isRecording: false,
  recordingTime: 0,
  chatHistory: [],
  currentChatId: null,
  mode: typeof window !== "undefined" && localStorage.getItem("neoChatMode")
    ? localStorage.getItem("neoChatMode")
    : (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  activeMode: "chat", // 'chat' | 'image' | 'thinking' | 'research' | 'shopping'
  attachments: [],
  settings: initialSettings,
  settingsOpen: false,
  searchQuery: "",
};

export const generateChatId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
};

export const saveChatToLocalStorage = (chatId, messages, title, lastMessage, isPinned = false) => {
  if (typeof window === "undefined") return [];

  const existingChats = JSON.parse(localStorage.getItem("neoChatHistory") || "[]");
  const existingIndex = existingChats.findIndex((chat) => chat.id === chatId);

  const validMessages = messages.filter((m) => m && (m.text || m.image || (m.attachments && m.attachments.length)));

  const chatData = {
    id: chatId,
    messages: validMessages,
    title: title || (existingIndex >= 0 ? existingChats[existingIndex].title : "New Chat"),
    timestamp: Date.now(),
    lastMessage: lastMessage || (existingIndex >= 0 ? existingChats[existingIndex].lastMessage : ""),
    pinned: existingIndex >= 0 ? existingChats[existingIndex].pinned || isPinned : isPinned,
  };

  if (existingIndex >= 0) {
    existingChats[existingIndex] = { ...existingChats[existingIndex], ...chatData };
  } else {
    existingChats.unshift(chatData);
  }

  // Keep up to 60 chats
  const limitedChats = existingChats.slice(0, 60);
  localStorage.setItem("neoChatHistory", JSON.stringify(limitedChats));

  return limitedChats;
};

export const exportChatAsFile = (chat, format = "markdown") => {
  if (!chat || !chat.messages) return;

  let content = "";
  let fileName = `${(chat.title || "chat").replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
  let mimeType = "text/plain";

  if (format === "json") {
    content = JSON.stringify(chat, null, 2);
    fileName += ".json";
    mimeType = "application/json";
  } else if (format === "markdown") {
    fileName += ".md";
    mimeType = "text/markdown";
    content = `# ${chat.title || "NeoChat Export"}\n`;
    content += `*Date: ${new Date(chat.timestamp || Date.now()).toLocaleString()}*\n\n---\n\n`;

    chat.messages.forEach((msg) => {
      const sender = msg.sender === "user" ? "### User" : "### Neo";
      content += `${sender} *(${msg.timestamp || ""})*\n\n`;
      if (msg.thinking) {
        content += `> **Thinking Process:**\n> ${msg.thinking.replace(/\n/g, "\n> ")}\n\n`;
      }
      if (msg.text) {
        content += `${msg.text}\n\n`;
      }
      if (msg.image) {
        content += `![Generated Image](${msg.image})\n\n`;
      }
      content += `---\n\n`;
    });
  } else {
    // Plain text
    fileName += ".txt";
    content = `${chat.title || "NeoChat Export"}\nDate: ${new Date(chat.timestamp || Date.now()).toLocaleString()}\n\n`;
    chat.messages.forEach((msg) => {
      const sender = msg.sender === "user" ? "User" : "Neo";
      content += `[${sender} - ${msg.timestamp || ""}]:\n${msg.text || (msg.image ? "[Image]" : "")}\n\n`;
    });
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
