import React, { createContext, useReducer, useContext, useEffect } from "react";
import { chatReducer, initialState } from "../reducers/chatReducer";
import { ACTIONS } from "../chatConstants";

const ChatContext = createContext();

export const UseChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("UseChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load initial state from localStorage on startup
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem("neoChatHistory");
      const savedMode = localStorage.getItem("neoChatMode");
      const savedGeminiKey = localStorage.getItem("neoGeminiApiKey");
      const activeGeminiKey =
        savedGeminiKey && savedGeminiKey !== "AIzaSyAvwpIqHyHv74Ok248qoqRcK5a6UHPO9XM" && savedGeminiKey.trim() !== ""
          ? savedGeminiKey
          : import.meta.env.VITE_GEMINI_API_KEY || "";
      const savedHfKey = localStorage.getItem("neoHfApiKey");
      const savedModel = localStorage.getItem("neoModel");
      const savedPrompt = localStorage.getItem("neoSystemPrompt");

      let chatHistory = [];
      if (savedChats) {
        chatHistory = JSON.parse(savedChats);
      }

      dispatch({
        type: ACTIONS.INIT_STATE,
        payload: {
          chatHistory,
          mode: savedMode || "light",
          settings: {
            geminiApiKey: activeGeminiKey,
            hfApiKey: savedHfKey || "",
            model: savedModel || "gemini-2.5-flash",
            systemPrompt: savedPrompt || "",
          },
        },
      });
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
  }, []);

  // Action Creators
  const actions = {
    startNewChat: () => dispatch({ type: ACTIONS.START_NEW_CHAT }),

    sendMessage: (messageData) => dispatch({ type: ACTIONS.SEND_MESSAGE, payload: messageData }),

    updateMessage: (index, updates) => dispatch({ type: ACTIONS.UPDATE_MESSAGE, payload: { index, updates } }),

    deleteMessage: (index) => dispatch({ type: ACTIONS.DELETE_MESSAGE, payload: { index } }),

    likeMessage: (index, feedback) => dispatch({ type: ACTIONS.LIKE_MESSAGE, payload: { index, feedback } }),

    loadChat: (chatId, closeSidebar = false) =>
      dispatch({ type: ACTIONS.LOAD_CHAT, payload: { chatId, closeSidebar } }),

    deleteChat: (chatId) => dispatch({ type: ACTIONS.DELETE_CHAT, payload: { chatId } }),

    clearAllChats: () => dispatch({ type: ACTIONS.CLEAR_ALL_CHATS }),

    renameChat: (chatId, title) => dispatch({ type: ACTIONS.RENAME_CHAT, payload: { chatId, title } }),

    pinChat: (chatId) => dispatch({ type: ACTIONS.PIN_CHAT, payload: { chatId } }),

    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),

    setInput: (input) => dispatch({ type: ACTIONS.SET_INPUT, payload: input }),

    setOpen: (open) => dispatch({ type: ACTIONS.SET_OPEN, payload: open }),

    toggleTheme: () => dispatch({ type: ACTIONS.TOGGLE_THEME }),

    setTheme: (theme) => dispatch({ type: ACTIONS.SET_THEME, payload: theme }),

    setRecording: (isRecording) => dispatch({ type: ACTIONS.SET_RECORDING, payload: isRecording }),

    updateRecordingTime: () => dispatch({ type: ACTIONS.UPDATE_RECORDING_TIME }),

    setActiveMode: (mode) => dispatch({ type: ACTIONS.SET_ACTIVE_MODE, payload: mode }),

    setAttachments: (attachments) => dispatch({ type: ACTIONS.SET_ATTACHMENTS, payload: attachments }),

    addAttachment: (attachment) => dispatch({ type: ACTIONS.ADD_ATTACHMENT, payload: attachment }),

    removeAttachment: (id) => dispatch({ type: ACTIONS.REMOVE_ATTACHMENT, payload: id }),

    clearAttachments: () => dispatch({ type: ACTIONS.CLEAR_ATTACHMENTS }),

    updateSettings: (settings) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings }),

    setSettingsOpen: (isOpen) => dispatch({ type: ACTIONS.SET_SETTINGS_OPEN, payload: isOpen }),

    setSearchQuery: (query) => dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query }),
  };

  const contextValue = {
    state,
    actions,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};
