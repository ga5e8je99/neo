// أنواع الإجراءات
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
  UPDATE_RECORDING_TIME: 'UPDATE_RECORDING_TIME',
  
};

// الحالة الابتدائية
export const initialState = {
  messages: [{}],
  input: '',
  loading: false,
  open: false,
  isRecording: false,
  recordingTime: 0,
  chatHistory: [],
  currentChatId: null,
  mode: 'light'
};

// المساعدات
const generateChatId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const saveChatToLocalStorage = (chatId, messages, title, lastMessage) => {
  const chatData = {
    id: chatId,
    messages: messages.filter(m => Object.keys(m).length > 0),
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

// Reducer الرئيسي
export const chatReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.START_NEW_CHAT: {
      const newChatId = generateChatId();
      return {
        ...state,
        messages: [{}],
        currentChatId: newChatId
      };
    }

    case ACTIONS.SEND_MESSAGE: {
      const { text, sender, timestamp } = action.payload;
      const newMessages = [...state.messages, { text, sender, timestamp }];
      
      let updatedCurrentChatId = state.currentChatId;
      if (!updatedCurrentChatId) {
        updatedCurrentChatId = generateChatId();
      }

      // حفظ المحادثة إذا كانت هناك رسائل
      let updatedChatHistory = state.chatHistory;
      if (newMessages.length > 1) {
        const title = newMessages[1]?.text?.substring(0, 30) + "..." || "New Chat";
        const lastMessage = newMessages[newMessages.length - 1]?.text?.substring(0, 50) + "..." || "";
        updatedChatHistory = saveChatToLocalStorage(
          updatedCurrentChatId, 
          newMessages, 
          title, 
          lastMessage
        );
      }

      return {
        ...state,
        messages: newMessages,
        currentChatId: updatedCurrentChatId,
        chatHistory: updatedChatHistory,
        input: '',
        loading: false
      };
    }

    case ACTIONS.LOAD_CHAT: {
      const { chatId } = action.payload;
      const chatToLoad = state.chatHistory.find(chat => chat.id === chatId);
      
      if (chatToLoad) {
        return {
          ...state,
          messages: chatToLoad.messages,
          currentChatId: chatId,
          open: action.payload.closeSidebar ? false : state.open
        };
      }
      return state;
    }

    case ACTIONS.DELETE_CHAT: {
      const { chatId: deleteId } = action.payload;
      const updatedChats = state.chatHistory.filter(chat => chat.id !== deleteId);
      
      localStorage.setItem("neoChatHistory", JSON.stringify(updatedChats));
      
      let newCurrentChatId = state.currentChatId;
      if (state.currentChatId === deleteId) {
        newCurrentChatId = generateChatId();
      }

      return {
        ...state,
        chatHistory: updatedChats,
        currentChatId: newCurrentChatId,
        messages: state.currentChatId === deleteId ? [{}] : state.messages
      };
    }

    case ACTIONS.CLEAR_ALL_CHATS:
      localStorage.removeItem("neoChatHistory");
      return {
        ...state,
        chatHistory: [],
        currentChatId: generateChatId(),
        messages: [{}]
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTIONS.SET_INPUT:
      return {
        ...state,
        input: action.payload
      };

    case ACTIONS.SET_OPEN:
      return {
        ...state,
        open: action.payload
      };

    case ACTIONS.TOGGLE_THEME: {
      const newMode = state.mode === 'dark' ? 'light' : 'dark';
      return {
        ...state,
        mode: newMode
      };
    }

    case ACTIONS.SET_RECORDING:
      return {
        ...state,
        isRecording: action.payload,
        recordingTime: action.payload ? state.recordingTime : 0
      };

    case ACTIONS.UPDATE_RECORDING_TIME:
      return {
        ...state,
        recordingTime: state.recordingTime + 1
      };

    case ACTIONS.INIT_STATE:
      return {
        ...state,
        chatHistory: action.payload.chatHistory || [],
        mode: action.payload.mode || 'light'
      };

    default:
      return state;
  }
};