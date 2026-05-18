import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import HistoryIcon from "@mui/icons-material/History";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import { UseChatContext } from "../Context/ChatContext";

// ─────────────────────────────────────────────
// ChatHistoryItem
// ─────────────────────────────────────────────
const ChatHistoryItem = ({
  chat,
  currentChatId,
  isDark,
  open,
  loadChat,
  deleteChat,
  isMobile,
  formatDate,
}) => {
  const [hovered, setHovered] = useState(false);
  const isActive = currentChatId === chat.id;

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        p: 1.5,
        mb: 0.75,
        borderRadius: "12px",
        cursor: "pointer",
        // FIX: نخفي الـ item ونمنع الكليك لما السايدبار مقفول
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "all 0.2s ease",
        bgcolor: isActive
          ? isDark
            ? "rgba(0,157,210,0.18)"
            : "rgba(0,157,210,0.09)"
          : hovered
            ? isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.04)"
            : "transparent",
        border: `1px solid ${
          isActive
            ? "rgba(0,157,210,0.4)"
            : isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)"
        }`,
        transform: hovered ? "translateX(4px)" : "translateX(0)",
      }}
      onClick={() => loadChat(chat.id, isMobile)}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        <ChatBubbleOutlineIcon
          sx={{
            fontSize: 14,
            mt: 0.3,
            color: isActive ? "primary.main" : "text.disabled",
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: "0.8rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: isActive ? "primary.main" : "text.primary",
            }}
          >
            {chat.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.disabled",
              fontSize: "0.7rem",
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mt: 0.25,
            }}
          >
            {chat.lastMessage}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.disabled",
              fontSize: "0.65rem",
              mt: 0.5,
              display: "block",
            }}
          >
            {formatDate(chat.timestamp)}
          </Typography>
        </Box>

        <IconButton
          size="small"
          sx={{
            p: 0.25,
            flexShrink: 0,
            color: "text.disabled",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s, color 0.2s",
            "&:hover": { color: "error.main" },
          }}
          onClick={(e) => {
            e.stopPropagation();
            deleteChat(chat.id);
          }}
        >
          <DeleteForeverIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────
// ChatNavbar
// ─────────────────────────────────────────────
const ChatNavbar = ({ isMobile }) => {
  const { state, actions } = UseChatContext();
  const { mode, chatHistory, currentChatId } = state;
  const { toggleTheme, startNewChat, clearAllChats, loadChat, deleteChat } =
    actions;

  const isDark = mode === "dark";
  const [open, setOpen] = useState(false);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((nowOnly - dateOnly) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const navbarItems = [
    {
      name: "New Chat",
      icon: <CreateIcon fontSize="small" />,
      action: startNewChat,
    },
    {
      name: "Clear All",
      icon: <DeleteForeverIcon fontSize="small" />,
      action: clearAllChats,
    },
    {
      name: isDark ? "Light Mode" : "Dark Mode",
      icon: isDark ? (
        <LightModeIcon fontSize="small" sx={{ color: "#ffd54f" }} />
      ) : (
        <DarkModeIcon fontSize="small" sx={{ color: "#5c6bc0" }} />
      ),
      action: toggleTheme,
    },
  ];

  const MobileToggleBtn = () =>
    isMobile && !open ? (
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 500,
          bgcolor: isDark ? "rgba(18,18,18,0.92)" : "rgba(248,249,252,0.92)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          "&:hover": { bgcolor: "primary.main", color: "#fff" },
          transition: "all 0.2s",
        }}
      >
        <MenuIcon fontSize="small" />
      </IconButton>
    ) : null;

  return (
    <>
      <MobileToggleBtn />

      {/* Mobile Overlay */}
      {isMobile && open && (
        <Box
          onClick={() => setOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.45)",
            zIndex: 399,
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease",
            "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <Box
        sx={{
          py: 2.5,
          bgcolor: isDark ? "rgba(18,18,18,0.95)" : "rgba(248,249,252,0.95)",
          backdropFilter: "blur(20px)",
          ...(!isMobile
            ? {
                minWidth: open ? "270px" : "56px",
                maxWidth: open ? "270px" : "56px",
                width: open ? "270px" : "56px",
              }
            : {
                width: open ? "min(85vw, 300px)" : "0px",
                minWidth: 0,
              }),
          overflow: "hidden",
          transition:
            "width 0.38s cubic-bezier(0.4,0,0.2,1), min-width 0.38s cubic-bezier(0.4,0,0.2,1), max-width 0.38s cubic-bezier(0.4,0,0.2,1)",
          borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          zIndex: 400,
          position: isMobile ? "fixed" : "relative",
          height: "100vh",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          boxShadow: isMobile && open ? "4px 0 30px rgba(0,0,0,0.25)" : "none",
        }}
      >
        {/* ── Inner wrapper ── */}
        <Box
          sx={{
            width: !isMobile ? "270px" : "min(85vw, 300px)",
            minWidth: !isMobile ? "270px" : "min(85vw, 300px)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              mb: 3,
              minHeight: 44,
            }}
          >
            <Box
              onClick={() => setOpen(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {/* Logo */}
              <Box
                sx={{
                  minWidth: 32,
                  width: 32,
                  height: 32,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #009dd2, #0a3fff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "16px",
                  boxShadow: "0 4px 14px rgba(0,157,210,0.35)",
                  flexShrink: 0,
                }}
              >
                N
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  background: "linear-gradient(135deg, #009dd2, #0a3fff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  opacity: open ? 1 : 0,
                  maxWidth: open ? "200px" : "0px",
                  transition: "opacity 0.3s, max-width 0.3s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                NeoChat
              </Typography>
            </Box>

            <IconButton
              size="small"
              sx={{
                color: "text.secondary",
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transition: "opacity 0.3s, transform 0.2s",
                "&:hover": { transform: "rotate(90deg)" },
                flexShrink: 0,
              }}
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Nav Items */}
          <Box sx={{ px: 1 }}>
            {navbarItems.map((item, index) => (
              <Tooltip
                key={index}
                title={!open ? item.name : ""}
                placement="right"
                arrow
              >
                <MenuItem
                  sx={{
                    borderRadius: "12px",
                    mb: 0.5,
                    py: 1.25,
                    px: open ? 2 : 1,
                    justifyContent: "flex-start",
                    gap: 1.5,
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                      "& .MuiSvgIcon-root": { color: "white !important" },
                      transform: "translateX(3px)",
                    },
                    transition: "all 0.2s ease",
                    color: "text.secondary",
                    minHeight: 44,
                    textAlign: "left",
                  }}
                  onClick={item.action}
                >
                  {item.icon}

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      opacity: open ? 1 : 0,
                      maxWidth: open ? "160px" : "0px",
                      overflow: "hidden",
                      transition: "opacity 0.25s, max-width 0.25s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </Typography>
                </MenuItem>
              </Tooltip>
            ))}
          </Box>

          {/* Divider */}
          <Box
            sx={{
              mx: 2,
              my: 2,
              height: "1px",
              bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
            }}
          />

          {/* Chat History */}
          <Box
            sx={{
              flexGrow: 1,
              // FIX: نوقف الـ scroll لما السايدبار مقفول + نخفي المحتوى بـ opacity
              overflowY: open ? "auto" : "hidden",
              overflowX: "hidden",
              opacity: open ? 1 : 0,
              transition: "opacity 0.3s",
              px: 1,
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": {
                background: isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.12)",
                borderRadius: "2px",
              },
            }}
          >
            {/* History Label */}
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                color: "text.secondary",
                fontWeight: 600,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                fontSize: "0.65rem",
                mb: 1.5,
                px: 1,
                whiteSpace: "nowrap",
              }}
            >
              <HistoryIcon sx={{ fontSize: 14 }} />
              History
            </Typography>

            {chatHistory.length === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  color: "text.disabled",
                  textAlign: "center",
                  py: 4,
                  fontSize: "0.8rem",
                  whiteSpace: "nowrap",
                }}
              >
                No conversations yet
              </Typography>
            ) : (
              chatHistory.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  chat={chat}
                  currentChatId={currentChatId}
                  isDark={isDark}
                  open={open}
                  loadChat={loadChat}
                  deleteChat={deleteChat}
                  isMobile={isMobile}
                  formatDate={formatDate}
                />
              ))
            )}
          </Box>

          {/* Divider */}
          <Box
            sx={{
              mx: 2,
              my: 1.5,
              height: "1px",
              bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
            }}
          />

          {/* Account */}
          <Box sx={{ px: 1, pb: 1 }}>
            <MenuItem
              sx={{
                borderRadius: "12px",
                py: 1.25,
                px: open ? 2 : 1,
                justifyContent: "flex-start",
                gap: 1.5,
                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                },
                transition: "all 0.2s",
              }}
            >
              <Avatar
                alt="User"
                src="/static/images/avatar/1.jpg"
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: 13,
                  background: "linear-gradient(135deg, #009dd2, #0a3fff)",
                  flexShrink: 0,
                }}
              >
                U
              </Avatar>

              <Box
                sx={{
                  opacity: open ? 1 : 0,
                  maxWidth: open ? "160px" : "0px",
                  transition: "opacity 0.3s, max-width 0.3s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                <Typography variant="body2" fontWeight={600} fontSize="0.85rem">
                  Account
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontSize="0.7rem"
                >
                  Free plan
                </Typography>
              </Box>
            </MenuItem>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ChatNavbar;