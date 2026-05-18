import React, { useState, useEffect, useRef } from "react";
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
import Tooltip from "@mui/material/Tooltip";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
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
  const messagesEndRef = useRef(null);

  const firstOptions = [
    "How to learn React?",
    "Explain quantum computing in simple terms",
    "What is the capital of France?",
    "Tell me a joke",
    "What are the benefits of meditation?",
  ];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

  useEffect(() => {
    return () => {
      if (recordingInterval) clearInterval(recordingInterval);
    };
  }, [recordingInterval]);

  const addMenuItems = [
    { icon: <LinkIcon fontSize="small" />, text: "Add photos & files" },
    { icon: <ImageIcon fontSize="small" />, text: "Create image" },
    { icon: <PsychologyIcon fontSize="small" />, text: "Thinking" },
    { icon: <SearchIcon fontSize="small" />, text: "Deep research" },
    { icon: <ShoppingCartIcon fontSize="small" />, text: "Shopping research" },
  ];

  const isDark = mode === "dark";

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: { xs: 1.5, sm: 2 },
        pb: { xs: 2, sm: 3 },
        width: !isMobile
          ? open
            ? "calc(100% - 280px)"
            : "calc(100% - 60px)"
          : "100%",
        transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
      }}
    >
      {/* Mobile menu button */}
      {isMobile && !open && (
        <IconButton
          sx={{
            position: "fixed",
            top: 14,
            left: 14,
            zIndex: 500,
            bgcolor: isDark ? "rgba(30,30,30,0.85)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(10px)",
            boxShadow: isDark
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.12)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            "&:hover": {
              bgcolor: isDark ? "rgba(40,40,40,0.95)" : "rgba(255,255,255,0.95)",
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
          }}
          onClick={() => setOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          zIndex: 300,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 1 ? (
          /* Welcome Screen */
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: { xs: 2, sm: 4, md: 6 },
              py: 4,
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {/* Logo/Avatar */}
            <Box
              sx={{
                width: { xs: 60, sm: 72 },
                height: { xs: 60, sm: 72 },
                borderRadius: "20px",
                background: "linear-gradient(135deg, #009dd2 0%, #0a3fff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
                boxShadow: "0 8px 32px rgba(0, 157, 210, 0.35)",
                fontSize: { xs: "22px", sm: "26px" },
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-1px",
              }}
            >
              N
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                textAlign: "center",
                fontSize: { xs: "1.3rem", sm: "1.6rem", md: "1.9rem" },
                lineHeight: 1.3,
              }}
            >
              Welcome to{" "}
              <Typography
                component="span"
                sx={{
                  color: "primary.main",
                  fontWeight: 900,
                  fontSize: "inherit",
                  background: "linear-gradient(135deg, #009dd2, #0a3fff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                NeoChat
              </Typography>
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                maxWidth: { xs: "95%", sm: "480px" },
                lineHeight: 1.7,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
              }}
            >
              Your AI assistant for technology, programming, science, and any
              topic you're curious about. Start with a suggestion or type below.
            </Typography>

            {/* Suggestion Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 1.5,
                width: "100%",
                maxWidth: { xs: "100%", sm: "520px", md: "600px" },
                mt: 1,
              }}
            >
              {firstOptions.map((option, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    cursor: "pointer",
                    bgcolor: isDark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(0, 0, 0, 0.03)",
                    borderRadius: "14px",
                    border: `1px solid ${
                      isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"
                    }`,
                    "&:hover": {
                      bgcolor: isDark
                        ? "rgba(0, 157, 210, 0.12)"
                        : "rgba(0, 157, 210, 0.07)",
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0, 157, 210, 0.15)",
                    },
                    transition: "all 0.25s ease",
                    // Last item spans full width if odd count
                    ...(index === firstOptions.length - 1 &&
                    firstOptions.length % 2 !== 0
                      ? { gridColumn: { sm: "span 2" } }
                      : {}),
                  }}
                  onClick={() => handleSend(option)}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  >
                    {option}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        ) : (
          /* Messages List */
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              p: { xs: 1, sm: 2, md: 3 },
              gap: 2,
              // Scroll past the input area
              pb: 1,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: isDark
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.15)",
                borderRadius: "3px",
                "&:hover": {
                  background: isDark
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(0,0,0,0.25)",
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
                      "0%": { opacity: 0, transform: "translateY(16px)" },
                      "100%": { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      position: "relative",
                      maxWidth: { xs: "88%", sm: "80%", md: "70%", lg: "65%" },
                      minWidth: "80px",
                      borderRadius:
                        msg.sender === "bot"
                          ? "4px 18px 18px 18px"
                          : "18px 4px 18px 18px",
                      background:
                        msg.sender === "bot"
                          ? isDark
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.04)"
                          : "linear-gradient(135deg, #009dd2 0%, #0a5fff 100%)",
                      color:
                        msg.sender === "user"
                          ? "#fff"
                          : isDark
                          ? "rgba(255,255,255,0.92)"
                          : "text.primary",
                      border: `1px solid ${
                        msg.sender === "bot"
                          ? isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.07)"
                          : "transparent"
                      }`,
                      backdropFilter:
                        msg.sender === "bot" ? "blur(10px)" : "none",
                      boxShadow:
                        msg.sender === "user"
                          ? "0 4px 20px rgba(0,157,210,0.3)"
                          : isDark
                          ? "0 2px 12px rgba(0,0,0,0.25)"
                          : "0 2px 12px rgba(0,0,0,0.06)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow:
                          msg.sender === "user"
                            ? "0 6px 28px rgba(0,157,210,0.4)"
                            : isDark
                            ? "0 4px 20px rgba(0,0,0,0.35)"
                            : "0 4px 20px rgba(0,0,0,0.1)",
                      },
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
                            width: 24,
                            height: 24,
                            background:
                              "linear-gradient(135deg, #009dd2, #0a3fff)",
                            fontSize: "10px",
                            fontWeight: "bold",
                          }}
                        >
                          N
                        </Avatar>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.6,
                            fontWeight: 700,
                            letterSpacing: "0.8px",
                            textTransform: "uppercase",
                            fontSize: "0.65rem",
                          }}
                        >
                          Neo
                        </Typography>
                      </Box>
                    )}

                    <Typography
                      sx={{
                        lineHeight: 1.7,
                        fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        "& a": {
                          color:
                            msg.sender === "bot" ? "primary.main" : "#d0f0ff",
                          textDecoration: "underline",
                          fontWeight: 500,
                        },
                        "& code": {
                          fontFamily: "'Fira Code', monospace",
                          backgroundColor: isDark
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.08)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.85em",
                        },
                        "& pre": {
                          backgroundColor: isDark
                            ? "rgba(0,0,0,0.3)"
                            : "rgba(0,0,0,0.05)",
                          padding: "12px",
                          borderRadius: "10px",
                          overflowX: "auto",
                          margin: "10px 0",
                          fontSize: { xs: "0.75rem", sm: "0.85rem" },
                        },
                        "& strong": { fontWeight: 700 },
                        "& em": { fontStyle: "italic" },
                      }}
                    >
                      {msg.text}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.75,
                        textAlign: msg.sender === "bot" ? "left" : "right",
                        opacity: 0.45,
                        fontSize: "0.65rem",
                      }}
                    >
                      {msg.timestamp}
                    </Typography>
                  </Paper>
                </Box>
              )
            )}

            {/* Loading indicator */}
            {loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  animation: "fadeInUp 0.3s ease-out",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "4px 18px 18px 18px",
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                    border: `1px solid ${
                      isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"
                    }`,
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      background: "linear-gradient(135deg, #009dd2, #0a3fff)",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    N
                  </Avatar>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          animation: "bounce 1.2s infinite ease-in-out",
                          animationDelay: `${i * 0.2}s`,
                          "@keyframes bounce": {
                            "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
                            "40%": { transform: "scale(1)", opacity: 1 },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <Box sx={{ zIndex: 200, mt: 1.5 }}>
        {/* Recording indicator */}
        {isRecording && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 1.5,
              p: 1.5,
              borderRadius: "12px",
              bgcolor: isDark
                ? "rgba(244,67,54,0.15)"
                : "rgba(244,67,54,0.08)",
              border: "1px solid rgba(244,67,54,0.3)",
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "error.main",
                animation: "pulse 1s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.3 },
                },
              }}
            />
            <Typography variant="caption" color="error" fontWeight={600}>
              Recording — {recordingTime}s
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<StopIcon />}
              onClick={stopRecording}
              sx={{ borderRadius: "8px", py: 0.25, fontSize: "0.75rem" }}
            >
              Stop
            </Button>
          </Box>
        )}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: `1.5px solid ${
              isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
            }`,
            bgcolor: isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: `0 0 0 3px ${
                isDark ? "rgba(0,157,210,0.2)" : "rgba(0,157,210,0.12)"
              }`,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              px: { xs: 1, sm: 1.5 },
              py: 0.75,
              gap: 0.5,
            }}
          >
            {/* Add Button */}
            <Tooltip title="Add attachment">
              <IconButton
                color="primary"
                size="small"
                sx={{
                  mb: 0.5,
                  opacity: 0.7,
                  "&:hover": { opacity: 1 },
                }}
                onClick={(e) => setAddMenuAnchor(e.currentTarget)}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={addMenuAnchor}
              open={Boolean(addMenuAnchor)}
              onClose={() => setAddMenuAnchor(null)}
              transformOrigin={{ vertical: "bottom", horizontal: "left" }}
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{
                sx: {
                  borderRadius: "14px",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  boxShadow: isDark
                    ? "0 8px 32px rgba(0,0,0,0.4)"
                    : "0 8px 32px rgba(0,0,0,0.12)",
                  mt: -1,
                },
              }}
            >
              {addMenuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  sx={{
                    borderRadius: "8px",
                    mx: 0.5,
                    "&:hover": { bgcolor: "primary.main", color: "white", "& .MuiListItemIcon-root": { color: "white" } },
                    transition: "all 0.2s",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primaryTypographyProps={{ fontSize: "0.875rem" }}>
                    {item.text}
                  </ListItemText>
                </MenuItem>
              ))}
            </Menu>

            {/* Text Input */}
            <TextField
              fullWidth
              multiline
              maxRows={5}
              variant="standard"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{ disableUnderline: true }}
              sx={{
                "& .MuiInputBase-root": {
                  py: 1,
                  px: 0.5,
                  fontSize: { xs: "0.875rem", sm: "0.95rem" },
                  lineHeight: 1.6,
                },
              }}
            />

            {/* Mic Button */}
            <Tooltip title={isRecording ? "Stop recording" : "Voice input"}>
              <IconButton
                color={isRecording ? "error" : "default"}
                size="small"
                sx={{
                  mb: 0.5,
                  opacity: 0.6,
                  "&:hover": { opacity: 1 },
                }}
                onClick={handleRecordClick}
              >
                {isRecording ? (
                  <StopIcon fontSize="small" />
                ) : (
                  <MicIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {/* Send Button */}
            <IconButton
              size="small"
              disabled={!input.trim() && !loading}
              onClick={() => handleSend()}
              sx={{
                mb: 0.5,
                width: 36,
                height: 36,
                borderRadius: "10px",
                background:
                  input.trim()
                    ? "linear-gradient(135deg, #009dd2, #0a3fff)"
                    : "transparent",
                color: input.trim() ? "#fff" : "text.disabled",
                "&:hover": {
                  background: input.trim()
                    ? "linear-gradient(135deg, #007bb8, #0030cc)"
                    : "transparent",
                  transform: input.trim() ? "scale(1.05)" : "none",
                },
                transition: "all 0.2s ease",
              }}
              onClick={() => handleSend()}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Paper>

        {/* Hint text */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1,
            opacity: 0.35,
            fontSize: "0.7rem",
          }}
        >
          Press Enter to send · Shift+Enter for new line
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatArea;