import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { chatReducer, initialState } from '../reducers/chatReducer';
import { ACTIONS } from './chatConstants';

const ChatContext = createContext();

export const UseChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // تحميل الحالة الأولية من localStorage
  useEffect(() => {
    const loadInitialState = () => {
      const savedChats = localStorage.getItem("neoChatHistory");
      const savedMode = localStorage.getItem("neoChatMode");
      const savedAiMode = localStorage.getItem("neoChatAiMode");
      
      let chatHistory = [];
      if (savedChats) {
        try {
          chatHistory = JSON.parse(savedChats);
        } catch (error) {
          console.error("Error parsing saved chats:", error);
        }
      }

      dispatch({
        type: ACTIONS.INIT_STATE,
        payload: {
          chatHistory,
          mode: savedMode || state.mode,
          aiMode: savedAiMode || state.aiMode
        }
      });
    };

    loadInitialState();
  }, [state.mode, state.aiMode]);

  // Actions Creators
  const actions = {
    startNewChat: () => dispatch({ type: ACTIONS.START_NEW_CHAT }),
    
    sendMessage: (messageData) => {
      dispatch({ type: ACTIONS.SEND_MESSAGE, payload: messageData });
    },
    
    loadChat: (chatId, closeSidebar = false) => {
      dispatch({ type: ACTIONS.LOAD_CHAT, payload: { chatId, closeSidebar } });
    },
    
    deleteChat: (chatId) => {
      dispatch({ type: ACTIONS.DELETE_CHAT, payload: { chatId } });
    },
    
    clearAllChats: () => dispatch({ type: ACTIONS.CLEAR_ALL_CHATS }),
    
    setLoading: (loading) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
    },
    
    setInput: (input) => {
      dispatch({ type: ACTIONS.SET_INPUT, payload: input });
    },
    
    setOpen: (open) => {
      dispatch({ type: ACTIONS.SET_OPEN, payload: open });
    },
    
    toggleTheme: () => dispatch({ type: ACTIONS.TOGGLE_THEME }),
    
    setRecording: (isRecording) => {
      dispatch({ type: ACTIONS.SET_RECORDING, payload: isRecording });
    },
    
    setAiMode: (aiMode) => {
      dispatch({ type: ACTIONS.SET_AI_MODE, payload: aiMode });
    },
    
    updateRecordingTime: () => {
      dispatch({ type: ACTIONS.UPDATE_RECORDING_TIME });
    },
    
  };

  // Context value
  const contextValue = {
    state,
    actions
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};