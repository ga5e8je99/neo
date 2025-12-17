import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import CloseIcon from '@mui/icons-material/Close';
import CreateIcon from '@mui/icons-material/Create';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import HistoryIcon from '@mui/icons-material/History';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { UseChatContext } from '../Context/ChatContext';

const ChatNavbar = ({ isMobile }) => {
  const { state, actions } = UseChatContext();
  const { open, mode, chatHistory, currentChatId } = state;
  const { setOpen, toggleTheme, startNewChat, clearAllChats, loadChat, deleteChat } = actions;

  // تنسيق التاريخ
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const navbarItems = [
    {
      name: "New Chat",
      icon: <CreateIcon />,
      action: startNewChat,
    },
    {
      name: "Clear All Chats",
      icon: <DeleteForeverIcon />,
      action: clearAllChats,
    },
    {
      name: "Toggle Theme",
      icon: mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />,
      action: toggleTheme,
    },
  ];

  return (
    <Box
      sx={{
        textAlign: "center",
        py: 3,
        bgcolor: 
          mode==="dark"?"#121212ae":"#f5f5f570" ,
        backdropFilter: isMobile ? "blur(10px)" : "none",
        width: !isMobile ? (open ? "280px" : "60px") : open ? "85%" : 0,
        overflow: "hidden",
        transition: "width 0.5s",
        borderRight: `1px solid ${mode === "dark" ? "#333" : "#ddd"}`,
        zIndex: 400,
        position: isMobile ? "fixed" : "relative",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            textAlign: "left",
            mb: 2,
          }}
        >
          <Box
            onClick={() => setOpen(true)}
            sx={{
              fontWeight: "700",
              color: "primary.main",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            
              <Box sx={{ display: "flex", alignItems: "center", gap: 5 }}>
                <ChatBubbleIcon />
                <Typography variant="h6">NeoChat</Typography>
              </Box>
            
          </Box>
          <IconButton
            sx={{
              p: 0,
              color: "grey.600",
              display: open ? "block" : "none",
            }}
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Navigation Buttons */}
        <Box>
          {navbarItems.map((item, index) => (
            <MenuItem
              key={index}
              sx={{
                mt: 1,
                borderRadius: "10px",
                "&:hover": {
                  bgcolor: "primary.main",
                  color: "white",
                },
                cursor: "pointer",
                transition: "all 0.3s",
                display: "flex",
                gap: 5,
                width: "100%",
              }}
              onClick={item.action}
            >
              {item.icon}
              <Typography>{item.name}</Typography>
            </MenuItem>
          ))}
        </Box>
        
        {/* Chat History Section */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", mt: 3, px: 2, overflowX: "hidden" }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: "text.secondary", 
              mb: 2, 
              display: "flex", 
              alignItems: "center", 
              gap: 1,
              opacity: open ? 1 : 0,
              transition: "opacity 0.3s"
            }}
          >
            <HistoryIcon fontSize="small" />
            Chat History
          </Typography>
          
          {chatHistory.length === 0 ? (
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary", 
                textAlign: "center", 
                py: 4,
                opacity: open ? 1 : 0,
                transition: "opacity 0.3s"
              }}
            >
              No chat history yet
            </Typography>
          ) : (
            chatHistory.map((chat) => (
              <Paper
                key={chat.id}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: "10px",
                  cursor: "pointer",
                  bgcolor: currentChatId === chat.id ? 
                    (mode === "dark" ? "primary.dark" : "primary.light") : 
                    (mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"),
                  border: `1px solid ${currentChatId === chat.id ? 
                    "primary.main" : 
                    (mode === "dark" ? "#333" : "#eee")}`,
                  "&:hover": {
                    bgcolor: mode === "dark" ? 
                      "rgba(255,255,255,0.1)" : 
                      "rgba(0,0,0,0.05)",
                    transform: "translateX(5px)",
                  },
                  transition: "all 0.3s",
                  opacity: open ? 1 : 0,
                  display: open ? "block" : "none",
                  position: "relative",
                }}
                onClick={() => loadChat(chat.id, isMobile)}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ flex: 1, overflow: "hidden" }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        mb: 0.5
                      }}
                    >
                      {chat.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block"
                      }}
                    >
                      {chat.lastMessage}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: "text.secondary",
                        mt: 1,
                        display: "block"
                      }}
                    >
                      {formatDate(chat.timestamp)}
                    </Typography>
                  </Box>
                  
                  <IconButton
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                  >
                    <DeleteForeverIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))
          )}
        </Box>
        
        {/* Account Menu */}
        <MenuItem
          sx={{
            mt: "auto",
            borderRadius: "10px",
            p: 2,
            opacity: open ? 1 : 0,
            transition: "opacity 0.3s"
          }}
        >
          <Avatar
            alt="User Avatar"
            src="/static/images/avatar/1.jpg"
            sx={{ width: 30, height: 30, mr: 2, fontSize: 15 }}
          />
          <Typography>Account</Typography>
        </MenuItem>
      </Box>
    </Box>
  );
};

export default ChatNavbar;