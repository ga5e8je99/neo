export const ACTIONS = {
  START_NEW_CHAT: 'START_NEW_CHAT',
  SEND_MESSAGE: 'SEND_MESSAGE',
  LOAD_CHAT: 'LOAD_CHAT',
  DELETE_CHAT: 'DELETE_CHAT',
  CLEAR_ALL_CHATS: 'CLEAR_ALL_CHATS',
  SET_LOADING: 'SET_LOADING',
  SET_INPUT: 'SET_INPUT',
  SET_OPEN: 'SET_OPEN',
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_RECORDING: 'SET_RECORDING',
  SET_AI_MODE: 'SET_AI_MODE',
  UPDATE_RECORDING_TIME: 'UPDATE_RECORDING_TIME',
  INIT_STATE: 'INIT_STATE'
};

export const initialState = {
  messages: [],
  input: '',
  loading: false,
  open: false,
  isRecording: false,
  recordingTime: 0,
  chatHistory: [],
  currentChatId: null,
  mode: window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  aiMode: 'gemini'
};

export const generateChatId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const saveChatToLocalStorage = (chatId, messages, title, lastMessage) => {
  const chatData = {
    id: chatId,
    messages: messages.filter(m => m.text && m.text.trim() !== ''),
    title: title || "New Chat",
    timestamp: Date.now(),
    lastMessage: lastMessage || ""
  };

  const existingChats = JSON.parse(localStorage.getItem("neoChatHistory") || "[]");
  const existingIndex = existingChats.findIndex(chat => chat.id === chatId);

  if (existingIndex >= 0) {
    existingChats[existingIndex] = chatData;
  } else {
    existingChats.unshift(chatData);
  }

  const limitedChats = existingChats.slice(0, 20);
  localStorage.setItem("neoChatHistory", JSON.stringify(limitedChats));
  
  return limitedChats;
};