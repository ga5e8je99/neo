import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";
import { UseChatContext } from "../Context/ChatContext";

const ChatArea = ({ isMobile, open }) => {
  const { state, actions } = UseChatContext();
  const { messages, input, loading, mode, isRecording, recordingTime } = state;
  const { setInput, setOpen, setRecording } = actions;
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [recordingInterval, setRecordingInterval] = useState(null);

  const firstOptions = [
    "How to learn React?",
    "Explain quantum computing in simple terms",
    "What is the capital of France?",
    "Tell me a joke",
    "What are the benefits of meditation?",
  ];

  const handleSend = async (value) => {
    const text = value?.trim() || input.trim();
    if (!text) return;

    const userMessage = {
      text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    actions.sendMessage(userMessage);
    actions.setInput("");
    actions.setLoading(true);

    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          contents: [{ parts: [{ text }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const botReply =
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I didn't understand that.";

      const botMessage = {
        text: botReply,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      actions.sendMessage(botMessage);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        text: "Error connecting to the Gemini API.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      actions.sendMessage(errorMessage);
    } finally {
      actions.setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleRecordClick = () => {
    if (!isRecording) {
      setRecording(true);
      actions.setRecording(true);

      const interval = setInterval(() => {
        actions.updateRecordingTime();
      }, 1000);

      setRecordingInterval(interval);
    } else {
      stopRecording();
    }
  };

  const stopRecording = () => {
    setRecording(false);
    actions.setRecording(false);
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
  };

  // تنظيف interval عند unmount
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingInterval]);

  const addMenuItems = [
    { icon: <LinkIcon fontSize="small" />, text: "Add photos & files" },
    { icon: <ImageIcon fontSize="small" />, text: "Create image" },
    { icon: <PsychologyIcon fontSize="small" />, text: "Thinking" },
    { icon: <SearchIcon fontSize="small" />, text: "Deep research" },
    { icon: <ShoppingCartIcon fontSize="small" />, text: "Shopping research" },
  ];

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
        width: !isMobile
          ? open
            ? "calc(100% - 280px)"
            : "calc(100% - 60px)"
          : "100%",
        transition: "width 0.5s",
      }}
    >
      {isMobile && !open && (
        <IconButton
          sx={{
            position: "fixed",
            top: 20,
            left: 20,
            zIndex: 500,
            bgcolor: "background.paper",
            boxShadow: 2,
          }}
          onClick={() => setOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Box sx={{ flexGrow: 1, position: "relative", zIndex: 300 }}>
        {messages.length === 1 ? (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              textAlign: "center",
              width: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ width: "100%", fontWeight: "700" }}
            >
              Welcome! Ask me anything about{" "}
              <Typography
                component="span"
                sx={{
                  color: "primary.main",
                  fontWeight: "900",
                  fontSize: "30px",
                }}
              >
                Neo
              </Typography>
              .
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: mode === "dark" ? "#969696ff" : "#202020ff",
                width: "80%",
              }}
            >
              I'm your AI assistant. Ask me anything about technology,
              programming, science, or any other topic. I'm here to help!
            </Typography>
            {firstOptions.map((option, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  p: 1,
                  width: "100%",
                  cursor: "pointer",
                  bgcolor:
                    mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                  borderRadius: "10px",
                  "&:hover": {
                    bgcolor:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                  },
                }}
                onClick={() => handleSend(option)}
              >
                <Typography variant="body2">{option}</Typography>
              </Paper>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              height: "80vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              p: { xs: 1, sm: 2, md: 3 },
              gap: 2,
              position: "relative",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background:
                  mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background:
                  mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                borderRadius: "4px",
                "&:hover": {
                  background:
                    mode === "dark"
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(0,0,0,0.3)",
                },
              },
            }}
          >
            {messages.map((msg, index) =>
              index === 0 ? null : (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.sender === "bot" ? "flex-start" : "flex-end",
                    animation: "fadeInUp 0.3s ease-out",
                    "@keyframes fadeInUp": {
                      "0%": {
                        opacity: 0,
                        transform: "translateY(20px)",
                      },
                      "100%": {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: { xs: 1.5, sm: 2, md: 2.5 },
                      position: "relative",
                      maxWidth: { xs: "90%", sm: "85%", md: "75%" },
                      minWidth: "120px",
                      borderRadius:
                        msg.sender === "bot"
                          ? "20px 20px 20px 4px"
                          : "20px 20px 4px 20px",
                      bgcolor:
                        msg.sender === "bot"
                          ? mode === "dark"
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(0, 0, 0, 0.03)"
                          : mode === "dark"
                          ? "linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)"
                          : "linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)",
                      color:
                        msg.sender === "bot"
                          ? mode === "dark"
                            ? "white"
                            : "text.primary"
                          : mode === "dark"
                          ? "#ffffff"
                          : "text.primary",
                      backdropFilter:
                        msg.sender === "bot" ? "blur(10px)" : "none",
                      border:
                        msg.sender === "bot"
                          ? `1px solid ${
                              mode === "dark"
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.1)"
                            }`
                          : "none",
                      boxShadow:
                        msg.sender === "bot"
                          ? mode === "dark"
                            ? "0 4px 20px rgba(0,0,0,0.3)"
                            : "0 4px 20px rgba(0,0,0,0.08)"
                          : "0 4px 25px rgba(33, 150, 243, 0.3)",
                      transformOrigin:
                        msg.sender === "bot" ? "top left" : "top right",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow:
                          msg.sender === "bot"
                            ? mode === "dark"
                              ? "0 6px 25px rgba(0,0,0,0.4)"
                              : "0 6px 25px rgba(0,0,0,0.12)"
                            : "0 6px 30px rgba(33, 150, 243, 0.4)",
                      },
                      "&::before":
                        msg.sender === "bot"
                          ? {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              background:
                                "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.03) 100%)",
                              borderRadius: "inherit",
                              pointerEvents: "none",
                            }
                          : {},
                    }}
                  >
                    {msg.sender === "bot" && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor:
                              mode === "dark"
                                ? "primary.dark"
                                : "primary.light",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          AI
                        </Avatar>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                          }}
                        >
                          Neo
                        </Typography>
                      </Box>
                    )}

                    <Typography
                      sx={{
                        lineHeight: 1.6,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        "& a": {
                          color: msg.sender === "bot" ? "primary.main" : "#fff",
                          textDecoration: "underline",
                          fontWeight: 500,
                        },
                        "& code": {
                          fontFamily: "monospace",
                          backgroundColor:
                            mode === "dark"
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.1)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.9em",
                        },
                        "& pre": {
                          backgroundColor:
                            mode === "dark"
                              ? "rgba(0,0,0,0.2)"
                              : "rgba(0,0,0,0.05)",
                          padding: "12px",
                          borderRadius: "8px",
                          overflowX: "auto",
                          margin: "8px 0",
                        },
                      }}
                    >
                      {msg.text}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        textAlign: msg.sender === "bot" ? "left" : "right",
                        opacity: 0.6,
                        fontSize: "0.7rem",
                      }}
                    >
                      {msg.timestamp}
                    </Typography>

                    {msg.sender !== "bot" && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -8,
                          right: 10,
                          width: 16,
                          height: 16,
                          backgroundColor:
                            mode === "dark" ? "#0d47a1" : "#0d47a1",
                          transform: "rotate(45deg)",
                          borderRadius: "2px",
                        }}
                      />
                    )}
                  </Paper>
                </Box>
              )
            )}

            {loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  animation: "fadeInUp 0.3s ease-out",
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: "20px 20px 20px 4px",
                    bgcolor:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.03)",
                    border: `1px solid ${
                      mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)"
                    }`,
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minWidth: "200px",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor:
                        mode === "dark" ? "primary.dark" : "primary.light",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    AI
                  </Avatar>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress
                      size={20}
                      thickness={4}
                      sx={{
                        color:
                          mode === "dark" ? "primary.light" : "primary.main",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          mode === "dark"
                            ? "rgba(255,255,255,0.8)"
                            : "text.secondary",
                        fontWeight: 500,
                      }}
                    >
                      Writing..
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Chat Input Area */}
      <Card
        sx={{
          mt: 2,
          backgroundColor: "transparent",
          boxShadow: "none",
          borderRadius: "25px",
          zIndex: 200,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: "25px",
            py: "0 !important",
            px: 3,
          }}
        >
          {/* Add Button Menu */}
          <Box sx={{ position: "relative" }}>
            <IconButton
              color="primary"
              sx={{ mr: 1 }}
              onClick={(e) => setAddMenuAnchor(e.currentTarget)}
            >
              <AddIcon />
            </IconButton>
            <Menu
              anchorEl={addMenuAnchor}
              open={Boolean(addMenuAnchor)}
              onClose={() => setAddMenuAnchor(null)}
              sx={{ mt: 1, position: "absolute" }}
            >
              {addMenuItems.map((item, index) => (
                <MenuItem key={index}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText>{item.text}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ border: "none" }}
          />

          <IconButton
            color="primary"
            onClick={() => handleSend()}
            sx={{ ml: 1 }}
          >
            <SendIcon />
          </IconButton>

          {/* Microphone Button */}
          <Box sx={{ position: "relative" }}>
            <IconButton
              color={isRecording ? "error" : "primary"}
              onClick={handleRecordClick}
              sx={{ ml: 1 }}
            >
              <MicIcon />
            </IconButton>
            {isRecording && (
              <Paper
                sx={{
                  position: "absolute",
                  bottom: "45px",
                  right: "0",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  minWidth: "150px",
                }}
              >
                <Typography variant="caption" color="error">
                  ● Recording
                </Typography>
                <Typography variant="caption">{recordingTime}s</Typography>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={stopRecording}
                >
                  Stop
                </Button>
              </Paper>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChatArea;
