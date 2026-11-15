import { ACTIONS, initialState, generateChatId, saveChatToLocalStorage } from "../chatConstants";

export { ACTIONS, initialState };

export const chatReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.START_NEW_CHAT: {
      const newChatId = generateChatId();
      return {
        ...state,
        messages: [],
        currentChatId: newChatId,
        input: "",
        attachments: [],
        activeMode: "chat",
      };
    }

    case ACTIONS.SEND_MESSAGE: {
      const message = action.payload;
      const newMessages = [...state.messages, message];

      let updatedCurrentChatId = state.currentChatId;
      if (!updatedCurrentChatId) {
        updatedCurrentChatId = generateChatId();
      }

      let updatedChatHistory = state.chatHistory;
      if (newMessages.length >= 1) {
        // Derive title from first user message
        const firstUserMsg = newMessages.find((m) => m.sender === "user");
        const title = firstUserMsg?.text
          ? firstUserMsg.text.substring(0, 32) + (firstUserMsg.text.length > 32 ? "..." : "")
          : "New Chat";
        const lastMsg = message.text ? message.text.substring(0, 50) + "..." : "[Media]";

        updatedChatHistory = saveChatToLocalStorage(
          updatedCurrentChatId,
          newMessages,
          title,
          lastMsg
        );
      }

      return {
        ...state,
        messages: newMessages,
        currentChatId: updatedCurrentChatId,
        chatHistory: updatedChatHistory,
        input: message.sender === "user" ? "" : state.input,
        attachments: message.sender === "user" ? [] : state.attachments,
        loading: message.sender === "user" ? true : false,
      };
    }

    case ACTIONS.UPDATE_MESSAGE: {
      const { index, updates } = action.payload;
      const newMessages = state.messages.map((msg, i) =>
        i === index ? { ...msg, ...updates } : msg
      );

      let updatedChatHistory = state.chatHistory;
      if (state.currentChatId) {
        const firstUserMsg = newMessages.find((m) => m.sender === "user");
        const title = firstUserMsg?.text
          ? firstUserMsg.text.substring(0, 32) + (firstUserMsg.text.length > 32 ? "..." : "")
          : "Chat";
        const lastMsg = newMessages[newMessages.length - 1]?.text || "";
        updatedChatHistory = saveChatToLocalStorage(
          state.currentChatId,
          newMessages,
          title,
          lastMsg
        );
      }

      return {
        ...state,
        messages: newMessages,
        chatHistory: updatedChatHistory,
      };
    }

    case ACTIONS.DELETE_MESSAGE: {
      const { index } = action.payload;
      const newMessages = state.messages.filter((_, i) => i !== index);

      let updatedChatHistory = state.chatHistory;
      if (state.currentChatId) {
        const existingChat = state.chatHistory.find((c) => c.id === state.currentChatId);
        const title = existingChat?.title || "Chat";
        const lastMsg = newMessages[newMessages.length - 1]?.text || "";
        updatedChatHistory = saveChatToLocalStorage(
          state.currentChatId,
          newMessages,
          title,
          lastMsg
        );
      }

      return {
        ...state,
        messages: newMessages,
        chatHistory: updatedChatHistory,
      };
    }

    case ACTIONS.LIKE_MESSAGE: {
      const { index, feedback } = action.payload; // feedback: 'up' | 'down' | null
      const newMessages = state.messages.map((msg, i) =>
        i === index ? { ...msg, feedback: msg.feedback === feedback ? null : feedback } : msg
      );
      return {
        ...state,
        messages: newMessages,
      };
    }

    case ACTIONS.LOAD_CHAT: {
      const { chatId, closeSidebar } = action.payload;
      const chatToLoad = state.chatHistory.find((chat) => chat.id === chatId);

      if (chatToLoad) {
        // Filter out empty mock objects
        const cleanMessages = (chatToLoad.messages || []).filter(
          (m) => m && (m.text || m.image || m.sender)
        );
        return {
          ...state,
          messages: cleanMessages,
          currentChatId: chatId,
          open: closeSidebar ? false : state.open,
          input: "",
          attachments: [],
          loading: false,
        };
      }
      return state;
    }

    case ACTIONS.DELETE_CHAT: {
      const { chatId: deleteId } = action.payload;
      const updatedChats = state.chatHistory.filter((chat) => chat.id !== deleteId);
      localStorage.setItem("neoChatHistory", JSON.stringify(updatedChats));

      let newCurrentChatId = state.currentChatId;
      let newMessages = state.messages;

      if (state.currentChatId === deleteId) {
        newCurrentChatId = generateChatId();
        newMessages = [];
      }

      return {
        ...state,
        chatHistory: updatedChats,
        currentChatId: newCurrentChatId,
        messages: newMessages,
      };
    }

    case ACTIONS.CLEAR_ALL_CHATS:
      localStorage.removeItem("neoChatHistory");
      return {
        ...state,
        chatHistory: [],
        currentChatId: generateChatId(),
        messages: [],
      };

    case ACTIONS.RENAME_CHAT: {
      const { chatId, title } = action.payload;
      const updatedChats = state.chatHistory.map((chat) =>
        chat.id === chatId ? { ...chat, title: title.trim() || chat.title } : chat
      );
      localStorage.setItem("neoChatHistory", JSON.stringify(updatedChats));
      return {
        ...state,
        chatHistory: updatedChats,
      };
    }

    case ACTIONS.PIN_CHAT: {
      const { chatId } = action.payload;
      const updatedChats = state.chatHistory.map((chat) =>
        chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat
      );
      localStorage.setItem("neoChatHistory", JSON.stringify(updatedChats));
      return {
        ...state,
        chatHistory: updatedChats,
      };
    }

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ACTIONS.SET_INPUT:
      return {
        ...state,
        input: action.payload,
      };

    case ACTIONS.SET_OPEN:
      return {
        ...state,
        open: action.payload,
      };

    case ACTIONS.TOGGLE_THEME: {
      const newMode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("neoChatMode", newMode);
      return {
        ...state,
        mode: newMode,
      };
    }

    case ACTIONS.SET_THEME: {
      localStorage.setItem("neoChatMode", action.payload);
      return {
        ...state,
        mode: action.payload,
      };
    }

    case ACTIONS.SET_RECORDING:
      return {
        ...state,
        isRecording: action.payload,
        recordingTime: action.payload ? state.recordingTime : 0,
      };

    case ACTIONS.UPDATE_RECORDING_TIME:
      return {
        ...state,
        recordingTime: state.recordingTime + 1,
      };

    case ACTIONS.SET_ACTIVE_MODE:
      return {
        ...state,
        activeMode: action.payload, // 'chat' | 'image' | 'thinking' | 'research' | 'shopping'
      };

    case ACTIONS.SET_ATTACHMENTS:
      return {
        ...state,
        attachments: action.payload,
      };

    case ACTIONS.ADD_ATTACHMENT:
      return {
        ...state,
        attachments: [...state.attachments, action.payload],
      };

    case ACTIONS.REMOVE_ATTACHMENT:
      return {
        ...state,
        attachments: state.attachments.filter((att) => att.id !== action.payload),
      };

    case ACTIONS.CLEAR_ATTACHMENTS:
      return {
        ...state,
        attachments: [],
      };

    case ACTIONS.UPDATE_SETTINGS: {
      const newSettings = { ...state.settings, ...action.payload };
      if (action.payload.geminiApiKey !== undefined) {
        localStorage.setItem("neoGeminiApiKey", action.payload.geminiApiKey);
      }
      if (action.payload.hfApiKey !== undefined) {
        localStorage.setItem("neoHfApiKey", action.payload.hfApiKey);
      }
      if (action.payload.model !== undefined) {
        localStorage.setItem("neoModel", action.payload.model);
      }
      if (action.payload.systemPrompt !== undefined) {
        localStorage.setItem("neoSystemPrompt", action.payload.systemPrompt);
      }
      if (action.payload.temperature !== undefined) {
        localStorage.setItem("neoTemperature", action.payload.temperature);
      }
      if (action.payload.soundEnabled !== undefined) {
        localStorage.setItem("neoSoundEnabled", action.payload.soundEnabled);
      }
      if (action.payload.speechLang !== undefined) {
        localStorage.setItem("neoSpeechLang", action.payload.speechLang);
      }
      return {
        ...state,
        settings: newSettings,
      };
    }

    case ACTIONS.SET_SETTINGS_OPEN:
      return {
        ...state,
        settingsOpen: action.payload,
      };

    case ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case ACTIONS.INIT_STATE:
      return {
        ...state,
        chatHistory: action.payload.chatHistory || [],
        mode: action.payload.mode || state.mode,
        settings: { ...state.settings, ...(action.payload.settings || {}) },
      };

    default:
      return state;
  }
};
