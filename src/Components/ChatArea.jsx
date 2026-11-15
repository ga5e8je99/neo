import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import ReplayIcon from "@mui/icons-material/Replay";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SettingsIcon from "@mui/icons-material/Settings";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { UseChatContext } from "../Context/ChatContext";
import { generateChatResponse, generateAiImage } from "../services/aiService";
import {
  createSpeechRecognition,
  speakText,
  stopSpeaking,
  playSoundEffect,
} from "../services/speechService";
import CodeBlock from "./CodeBlock";
import ThinkingBox from "./ThinkingBox";
import ImageMessage from "./ImageMessage";

const ChatArea = ({ isMobile, open }) => {
  const { state, actions } = UseChatContext();
  const {
    messages,
    input,
    loading,
    mode,
    isRecording,
    activeMode,
    attachments,
    settings,
  } = state;
  const {
    setInput,
    setRecording,
    setActiveMode,
    addAttachment,
    removeAttachment,
    clearAttachments,
    setSettingsOpen,
    deleteMessage,
    likeMessage,
  } = actions;

  const isDark = mode === "dark";
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [speechRecognizer, setSpeechRecognizer] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const welcomeOptions = [
    { title: "Modern React Patterns", prompt: "Explain React 19 hooks and server components with practical examples" },
    { title: "Quantum Computing", prompt: "Explain quantum superposition and entanglement in simple terms" },
    { title: "Generate Cyberpunk Image", prompt: "A glowing futuristic cyberpunk city with neon reflections in the rain, 8k", isImage: true },
    { title: "Deep Research AI", prompt: "Provide an in-depth research breakdown on the evolution of LLMs and reasoning models", mode: "research" },
    { title: "Shopping Tech Guide", prompt: "Compare the top developer laptops in 2026: MacBook Pro vs Dell XPS vs ThinkPad", mode: "shopping" },
  ];

  // Auto-scroll on new messages or loading state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Clean speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speechRecognizer) {
        speechRecognizer.stop();
      }
    };
  }, [speechRecognizer]);

  // Handle Speech Recognition Toggle
  const handleToggleVoice = () => {
    if (isRecording) {
      if (speechRecognizer) {
        speechRecognizer.stop();
      }
      setRecording(false);
      setSpeechRecognizer(null);
    } else {
      const recognizer = createSpeechRecognition({
        lang: settings.speechLang,
        onResult: ({ finalTranscript, interimTranscript }) => {
          const text = finalTranscript || interimTranscript;
          if (text) {
            setInput((prev) => (prev ? `${prev} ${text}` : text));
          }
        },
        onError: (err) => {
          console.warn("Speech recognition error:", err);
          setRecording(false);
          setSpeechRecognizer(null);
        },
        onEnd: () => {
          setRecording(false);
          setSpeechRecognizer(null);
        },
      });

      if (recognizer) {
        try {
          recognizer.start();
          setSpeechRecognizer(recognizer);
          setRecording(true);
        } catch (e) {
          console.error("Recognizer start error:", e);
        }
      }
    }
  };

  // Handle File Input Selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => processFile(file));
    e.target.value = "";
    setAddMenuAnchor(null);
  };

  const processFile = (file) => {
    if (!file) return;
    const isImg = file.type.startsWith("image/");
    const reader = new FileReader();

    reader.onload = (event) => {
      const attachment = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + " KB",
        base64: isImg ? event.target.result : null,
        content: !isImg ? event.target.result : null,
      };
      addAttachment(attachment);
    };

    if (isImg) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Handle Paste from Clipboard
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        processFile(file);
      }
    }
  };

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []);
    files.forEach((file) => processFile(file));
  };

  // Main Send Function
  const handleSend = async (overrideText, overrideMode) => {
    const textToSend = (overrideText !== undefined ? overrideText : input).trim();
    if (!textToSend && attachments.length === 0) return;

    const currentMode = overrideMode || activeMode;

    if (settings.soundEnabled) playSoundEffect("send");

    // Check if user wants image generation
    const isImageCommand =
      currentMode === "image" ||
      textToSend.toLowerCase().startsWith("/image ") ||
      textToSend.toLowerCase().startsWith("/img ");

    const cleanPrompt = isImageCommand
      ? textToSend.replace(/^\/(image|img)\s+/i, "")
      : textToSend;

    const userMessage = {
      text: cleanPrompt,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments: [...attachments],
      mode: currentMode,
    };

    actions.sendMessage(userMessage);
    actions.setInput("");
    clearAttachments();
    actions.setLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      if (isImageCommand) {
        // Real Image Generation Flow
        const result = await generateAiImage(cleanPrompt, {
          model: "flux",
          width: 1024,
          height: 1024,
        });

        const botMessage = {
          text: `Generated image for: **${cleanPrompt}**`,
          image: result.imageUrl,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          mode: "image",
        };

        actions.sendMessage(botMessage);
      } else {
        // Chat / Thinking / Research / Shopping Flow
        const response = await generateChatResponse({
          messages: [...messages, userMessage],
          attachments: userMessage.attachments,
          settings,
          activeMode: currentMode,
          abortSignal: abortControllerRef.current.signal,
        });

        const botMessage = {
          text: response.text,
          thinking: response.thinking,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          mode: currentMode,
          modelUsed: response.modelUsed,
          isFallback: response.isFallback,
        };

        actions.sendMessage(botMessage);
      }

      if (settings.soundEnabled) playSoundEffect("receive");
    } catch (err) {
      if (err.name === "CanceledError" || err.message === "canceled") {
        console.log("Generation stopped by user.");
      } else {
        console.error("Generation error:", err);
        const errorMessage = {
          text: "Connection error or timeout. Please check your network or enter a valid Gemini API Key in Settings.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        actions.sendMessage(errorMessage);
      }
    } finally {
      actions.setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    actions.setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Read Aloud / Speak Message
  const handleSpeak = (text, index) => {
    if (speakingIndex === index) {
      stopSpeaking();
      setSpeakingIndex(null);
    } else {
      stopSpeaking();
      setSpeakingIndex(index);
      speakText(text, {
        onEnd: () => setSpeakingIndex(null),
        onError: () => setSpeakingIndex(null),
      });
    }
  };

  // Copy Message Text
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Regenerate Response
  const handleRegenerate = (index) => {
    // Find the previous user prompt
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].sender === "user") {
        handleSend(messages[i].text, messages[i].mode);
        break;
      }
    }
  };

  // Edit Message
  const handleEdit = (msg) => {
    setInput(msg.text);
  };

  const addMenuItems = [
    {
      icon: <LinkIcon fontSize="small" sx={{ color: "#38bdf8" }} />,
      text: "Add photos & files",
      action: () => fileInputRef.current?.click(),
    },
    {
      icon: <ImageIcon fontSize="small" sx={{ color: "#ec4899" }} />,
      text: "Create image",
      action: () => {
        setActiveMode("image");
        setAddMenuAnchor(null);
      },
    },
    {
      icon: <PsychologyIcon fontSize="small" sx={{ color: "#a855f7" }} />,
      text: "Thinking mode",
      action: () => {
        setActiveMode(activeMode === "thinking" ? "chat" : "thinking");
        setAddMenuAnchor(null);
      },
    },
    {
      icon: <SearchIcon fontSize="small" sx={{ color: "#10b981" }} />,
      text: "Deep research",
      action: () => {
        setActiveMode(activeMode === "research" ? "chat" : "research");
        setAddMenuAnchor(null);
      },
    },
    {
      icon: <ShoppingCartIcon fontSize="small" sx={{ color: "#f59e0b" }} />,
      text: "Shopping research",
      action: () => {
        setActiveMode(activeMode === "shopping" ? "chat" : "shopping");
        setAddMenuAnchor(null);
      },
    },
  ];

  const getModeLabel = () => {
    switch (activeMode) {
      case "image":
        return { label: "Image Generation Mode", color: "#ec4899" };
      case "thinking":
        return { label: "Thinking Mode (Reasoning)", color: "#a855f7" };
      case "research":
        return { label: "Deep Research Mode", color: "#10b981" };
      case "shopping":
        return { label: "Shopping Research Mode", color: "#f59e0b" };
      default:
        return null;
    }
  };

  const modeBadge = getModeLabel();

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: { xs: 1.5, sm: 2 },
        pb: { xs: 2, sm: 2.5 },
        width: !isMobile
          ? open
            ? "calc(100% - 280px)"
            : "calc(100% - 60px)"
          : "100%",
        transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
      }}
    >
      {/* Hidden File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,.pdf,.txt,.md,.json,.js,.py,.html,.css,.csv"
        style={{ display: "none" }}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <Box
          sx={{
            position: "absolute",
            inset: 16,
            borderRadius: "24px",
            border: "2px dashed #009dd2",
            bgcolor: isDark ? "rgba(0, 157, 210, 0.15)" : "rgba(0, 157, 210, 0.08)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
            pointerEvents: "none",
          }}
        >
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Drop images or files here to attach
          </Typography>
        </Box>
      )}

      {/* Top Banner if API Key is not configured */}
      {(!settings.geminiApiKey || settings.geminiApiKey.length < 10) && (
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setSettingsOpen(true)}
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Add Key
            </Button>
          }
          sx={{
            mb: 1,
            borderRadius: "12px",
            py: 0.25,
            fontSize: "0.78rem",
            bgcolor: isDark ? "rgba(2, 132, 199, 0.15)" : "rgba(2, 132, 199, 0.08)",
            border: `1px solid ${isDark ? "rgba(2, 132, 199, 0.3)" : "rgba(2, 132, 199, 0.2)"}`,
          }}
        >
          Tip: Add your <strong>Free Google Gemini API Key</strong> in Settings to enable direct real-time AI & vision analysis!
        </Alert>
      )}

      {/* Messages Scroll Area */}
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
        {messages.length === 0 ? (
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
            {/* Logo */}
            <Box
              sx={{
                width: { xs: 64, sm: 76 },
                height: { xs: 64, sm: 76 },
                borderRadius: "22px",
                background: "linear-gradient(135deg, #009dd2 0%, #0a3fff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
                boxShadow: "0 10px 36px rgba(0, 157, 210, 0.4)",
                fontSize: { xs: "24px", sm: "28px" },
                fontWeight: 900,
                color: "#fff",
              }}
            >
              N
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                textAlign: "center",
                fontSize: { xs: "1.4rem", sm: "1.8rem", md: "2.1rem" },
              }}
            >
              Welcome to{" "}
              <Typography
                component="span"
                sx={{
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
                maxWidth: "520px",
                lineHeight: 1.7,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
              }}
            >
              Next-generation AI assistant with real image generation, multimodal vision, deep reasoning, and live voice recognition. Pick a prompt or type below:
            </Typography>

            {/* Suggestion Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
                width: "100%",
                maxWidth: "620px",
                mt: 1.5,
              }}
            >
              {welcomeOptions.map((opt, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  onClick={() => {
                    if (opt.isImage) {
                      setActiveMode("image");
                      handleSend(opt.prompt, "image");
                    } else if (opt.mode) {
                      setActiveMode(opt.mode);
                      handleSend(opt.prompt, opt.mode);
                    } else {
                      handleSend(opt.prompt, "chat");
                    }
                  }}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    cursor: "pointer",
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
                    borderRadius: "14px",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                    "&:hover": {
                      bgcolor: isDark ? "rgba(0, 157, 210, 0.12)" : "rgba(0, 157, 210, 0.07)",
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0, 157, 210, 0.18)",
                    },
                    transition: "all 0.25s ease",
                    ...(index === welcomeOptions.length - 1 ? { gridColumn: { sm: "span 2" } } : {}),
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary" }}
                  >
                    {opt.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontSize: "0.75rem", display: "block", mt: 0.5 }}
                  >
                    {opt.prompt}
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
              gap: 2.5,
              pb: 2,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
                borderRadius: "3px",
              },
            }}
          >
            {messages.map((msg, index) => {
              if (!msg || (!msg.text && !msg.image && (!msg.attachments || !msg.attachments.length))) {
                return null;
              }

              const isBot = msg.sender === "bot";

              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: isBot ? "flex-start" : "flex-end",
                    animation: "fadeInUp 0.3s ease-out",
                    "@keyframes fadeInUp": {
                      "0%": { opacity: 0, transform: "translateY(14px)" },
                      "100%": { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: { xs: "92%", sm: "85%", md: "75%", lg: "70%" },
                      minWidth: "120px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isBot ? "flex-start" : "flex-end",
                    }}
                  >
                    {/* Bot Identifier */}
                    {isBot && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75, px: 0.5 }}>
                        <Avatar
                          sx={{
                            width: 22,
                            height: 22,
                            background: "linear-gradient(135deg, #009dd2, #0a3fff)",
                            fontSize: "10px",
                            fontWeight: 800,
                          }}
                        >
                          N
                        </Avatar>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            letterSpacing: "0.8px",
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                            color: "text.secondary",
                          }}
                        >
                          Neo {msg.modelUsed ? `• ${msg.modelUsed}` : ""}
                        </Typography>
                      </Box>
                    )}

                    {/* Message Bubble */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.75, sm: 2.25 },
                        borderRadius: isBot ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                        background: isBot
                          ? isDark
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.03)"
                          : "linear-gradient(135deg, #009dd2 0%, #0a5fff 100%)",
                        color: !isBot
                          ? "#fff"
                          : isDark
                          ? "rgba(255,255,255,0.92)"
                          : "text.primary",
                        border: `1px solid ${
                          isBot
                            ? isDark
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(0,0,0,0.08)"
                            : "transparent"
                        }`,
                        backdropFilter: isBot ? "blur(10px)" : "none",
                        boxShadow: !isBot
                          ? "0 4px 20px rgba(0,157,210,0.3)"
                          : isDark
                          ? "0 2px 12px rgba(0,0,0,0.25)"
                          : "0 2px 12px rgba(0,0,0,0.05)",
                        width: "100%",
                      }}
                    >
                      {/* Attached Files & Images Preview */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                          {msg.attachments.map((att, attIdx) => (
                            <Box
                              key={attIdx}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                                px: 1.25,
                                py: 0.5,
                                borderRadius: "8px",
                                bgcolor: isBot
                                  ? "rgba(0,0,0,0.2)"
                                  : "rgba(255,255,255,0.2)",
                                fontSize: "0.75rem",
                              }}
                            >
                              {att.base64 ? (
                                <Box
                                  component="img"
                                  src={att.base64}
                                  alt={att.name}
                                  sx={{ width: 24, height: 24, borderRadius: "4px", objectFit: "cover" }}
                                />
                              ) : (
                                <InsertDriveFileIcon sx={{ fontSize: 16 }} />
                              )}
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {att.name}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Thinking Process Accordion */}
                      {msg.thinking && (
                        <ThinkingBox thinking={msg.thinking} isDark={isDark} />
                      )}

                      {/* Real Image Card */}
                      {msg.image && (
                        <ImageMessage imageUrl={msg.image} prompt={msg.text} isDark={isDark} />
                      )}

                      {/* Markdown Text Content */}
                      {msg.text && (
                        <Box
                          dir="auto"
                          sx={{
                            lineHeight: 1.7,
                            fontSize: { xs: "0.875rem", sm: "0.95rem" },
                            "& p": { my: 0.75, "&:first-of-type": { mt: 0 }, "&:last-of-type": { mb: 0 } },
                            "& h1, & h2, & h3, & h4": { fontWeight: 800, mt: 1.5, mb: 0.75 },
                            "& ul, & ol": { pl: 2.5, my: 0.75 },
                            "& li": { my: 0.25 },
                            "& blockquote": {
                              borderLeft: "4px solid #009dd2",
                              pl: 1.5,
                              my: 1,
                              fontStyle: "italic",
                              opacity: 0.85,
                            },
                            "& table": {
                              width: "100%",
                              borderCollapse: "collapse",
                              my: 1.5,
                              fontSize: "0.85rem",
                            },
                            "& th, & td": {
                              border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`,
                              p: 1,
                              textAlign: "left",
                            },
                            "& th": {
                              bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                              fontWeight: 700,
                            },
                            "& code": {
                              fontFamily: "'Fira Code', monospace",
                              backgroundColor: !isBot
                                ? "rgba(255,255,255,0.2)"
                                : isDark
                                ? "rgba(255,255,255,0.12)"
                                : "rgba(0,0,0,0.08)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "0.88em",
                            },
                            "& a": {
                              color: !isBot ? "#e0f2fe" : "primary.main",
                              textDecoration: "underline",
                              fontWeight: 600,
                            },
                          }}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                  <CodeBlock
                                    language={match[1]}
                                    value={String(children).replace(/\n$/, "")}
                                  />
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </Box>
                      )}

                      {/* Timestamp */}
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 1,
                          textAlign: isBot ? "left" : "right",
                          opacity: 0.45,
                          fontSize: "0.65rem",
                        }}
                      >
                        {msg.timestamp}
                      </Typography>
                    </Paper>

                    {/* Action Bar Below Message */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 0.5,
                        px: 0.5,
                        opacity: 0.7,
                        "&:hover": { opacity: 1 },
                        transition: "opacity 0.2s",
                      }}
                    >
                      {/* Copy */}
                      <Tooltip title={copiedIndex === index ? "Copied!" : "Copy"}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(msg.text, index)}
                          sx={{ p: 0.5 }}
                        >
                          {copiedIndex === index ? (
                            <CheckIcon sx={{ fontSize: 14, color: "success.main" }} />
                          ) : (
                            <ContentCopyIcon sx={{ fontSize: 14 }} />
                          )}
                        </IconButton>
                      </Tooltip>

                      {/* Text to Speech (Bot only) */}
                      {isBot && (
                        <Tooltip title={speakingIndex === index ? "Stop voice" : "Read aloud"}>
                          <IconButton
                            size="small"
                            onClick={() => handleSpeak(msg.text, index)}
                            sx={{ p: 0.5, color: speakingIndex === index ? "primary.main" : "inherit" }}
                          >
                            {speakingIndex === index ? (
                              <VolumeOffIcon sx={{ fontSize: 14 }} />
                            ) : (
                              <VolumeUpIcon sx={{ fontSize: 14 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Regenerate (Bot only) */}
                      {isBot && (
                        <Tooltip title="Regenerate answer">
                          <IconButton
                            size="small"
                            onClick={() => handleRegenerate(index)}
                            sx={{ p: 0.5 }}
                          >
                            <ReplayIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Edit (User only) */}
                      {!isBot && (
                        <Tooltip title="Edit prompt">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(msg)}
                            sx={{ p: 0.5 }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Thumbs Up / Down (Bot only) */}
                      {isBot && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => likeMessage(index, "up")}
                            sx={{
                              p: 0.5,
                              color: msg.feedback === "up" ? "primary.main" : "inherit",
                            }}
                          >
                            {msg.feedback === "up" ? (
                              <ThumbUpIcon sx={{ fontSize: 13 }} />
                            ) : (
                              <ThumbUpOutlinedIcon sx={{ fontSize: 13 }} />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => likeMessage(index, "down")}
                            sx={{
                              p: 0.5,
                              color: msg.feedback === "down" ? "error.main" : "inherit",
                            }}
                          >
                            {msg.feedback === "down" ? (
                              <ThumbDownIcon sx={{ fontSize: 13 }} />
                            ) : (
                              <ThumbDownOutlinedIcon sx={{ fontSize: 13 }} />
                            )}
                          </IconButton>
                        </>
                      )}

                      {/* Delete Single Message */}
                      <Tooltip title="Delete message">
                        <IconButton
                          size="small"
                          onClick={() => deleteMessage(index)}
                          sx={{ p: 0.5, "&:hover": { color: "error.main" } }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "flex-start", animation: "fadeInUp 0.3s ease-out" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "4px 18px 18px 18px",
                    bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 26,
                      height: 26,
                      background: "linear-gradient(135deg, #009dd2, #0a3fff)",
                      fontSize: "10px",
                      fontWeight: 800,
                    }}
                  >
                    N
                  </Avatar>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          animation: "bounce 1.2s infinite ease-in-out",
                          animationDelay: `${i * 0.2}s`,
                          "@keyframes bounce": {
                            "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.3 },
                            "40%": { transform: "scale(1)", opacity: 1 },
                          },
                        }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ ml: 1, opacity: 0.6, fontStyle: "italic" }}>
                    {activeMode === "thinking"
                      ? "Reasoning and analyzing..."
                      : activeMode === "image"
                      ? "Synthesizing image..."
                      : activeMode === "research"
                      ? "Executing deep research..."
                      : "Generating response..."}
                  </Typography>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input & Action Dock */}
      <Box sx={{ zIndex: 200, mt: 1 }}>
        {/* Mode Indicator Badge */}
        {modeBadge && (
          <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              size="small"
              label={modeBadge.label}
              onDelete={() => setActiveMode("chat")}
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                border: `1px solid ${modeBadge.color}`,
                color: modeBadge.color,
              }}
            />
          </Box>
        )}

        {/* Attachment Chips Preview */}
        {attachments.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            {attachments.map((att) => (
              <Chip
                key={att.id}
                size="small"
                avatar={
                  att.base64 ? (
                    <Avatar src={att.base64} />
                  ) : (
                    <InsertDriveFileIcon sx={{ fontSize: 16 }} />
                  )
                }
                label={`${att.name} (${att.size})`}
                onDelete={() => removeAttachment(att.id)}
                sx={{
                  borderRadius: "8px",
                  bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                }}
              />
            ))}
          </Box>
        )}

        {/* Real Voice Recording Waveform Bar */}
        {isRecording && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              mb: 1,
              px: 2,
              py: 1,
              borderRadius: "12px",
              bgcolor: isDark ? "rgba(244,67,54,0.15)" : "rgba(244,67,54,0.08)",
              border: "1px solid rgba(244,67,54,0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "error.main",
                  animation: "pulse 1s infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)", opacity: 1 },
                    "50%": { transform: "scale(1.4)", opacity: 0.4 },
                  },
                }}
              />
              <Typography variant="body2" color="error" fontWeight={700}>
                Listening to your voice... Speak now
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<StopIcon />}
              onClick={handleToggleVoice}
              sx={{ borderRadius: "8px", py: 0.25, fontSize: "0.75rem", textTransform: "none" }}
            >
              Done
            </Button>
          </Box>
        )}

        {/* Input Bar */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
            bgcolor: isDark ? "rgba(24,26,31,0.75)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: `0 0 0 3px ${isDark ? "rgba(0,157,210,0.2)" : "rgba(0,157,210,0.12)"}`,
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
            {/* Attachment Menu Button */}
            <Tooltip title="Tools & attachments">
              <IconButton
                color="primary"
                size="small"
                onClick={(e) => setAddMenuAnchor(e.currentTarget)}
                sx={{ mb: 0.5 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Menu */}
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
                    ? "0 8px 32px rgba(0,0,0,0.5)"
                    : "0 8px 32px rgba(0,0,0,0.12)",
                },
              }}
            >
              {addMenuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  onClick={item.action}
                  sx={{
                    borderRadius: "8px",
                    mx: 0.5,
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                      "& .MuiListItemIcon-root": { color: "white" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
                  <ListItemText primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {item.text}
                  </ListItemText>
                </MenuItem>
              ))}
            </Menu>

            {/* Text Input Field */}
            <TextField
              fullWidth
              multiline
              maxRows={6}
              variant="standard"
              dir="auto"
              placeholder={
                activeMode === "image"
                  ? "Describe the image you want to generate in detail..."
                  : activeMode === "thinking"
                  ? "Ask any question in deep thinking mode..."
                  : activeMode === "research"
                  ? "What topic should Neo investigate and research?"
                  : activeMode === "shopping"
                  ? "What product or comparison are you shopping for?"
                  : "Ask anything, attach files, or type /image..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
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

            {/* Speech Recognition Mic Button */}
            <Tooltip title={isRecording ? "Stop voice" : "Voice input (Speech to Text)"}>
              <IconButton
                color={isRecording ? "error" : "default"}
                size="small"
                onClick={handleToggleVoice}
                sx={{ mb: 0.5, opacity: isRecording ? 1 : 0.65 }}
              >
                {isRecording ? <StopIcon fontSize="small" /> : <MicIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Stop or Send Button */}
            {loading ? (
              <Tooltip title="Stop generation">
                <IconButton
                  size="small"
                  onClick={handleStopGeneration}
                  sx={{
                    mb: 0.5,
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "error.main",
                    color: "#fff",
                    "&:hover": { bgcolor: "error.dark", transform: "scale(1.05)" },
                    transition: "all 0.2s ease",
                  }}
                >
                  <StopCircleIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            ) : (
              <IconButton
                size="small"
                disabled={!input.trim() && attachments.length === 0}
                onClick={() => handleSend()}
                sx={{
                  mb: 0.5,
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background:
                    input.trim() || attachments.length > 0
                      ? "linear-gradient(135deg, #009dd2, #0a3fff)"
                      : "transparent",
                  color: input.trim() || attachments.length > 0 ? "#fff" : "text.disabled",
                  "&:hover": {
                    background:
                      input.trim() || attachments.length > 0
                        ? "linear-gradient(135deg, #007bb8, #0030cc)"
                        : "transparent",
                    transform: input.trim() || attachments.length > 0 ? "scale(1.05)" : "none",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <SendIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        </Paper>

        {/* Footer Hint */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 0.75,
            opacity: 0.4,
            fontSize: "0.7rem",
          }}
        >
          Press Enter to send · Shift+Enter for new line · Supports Drag & Drop and Ctrl+V for images
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatArea;
