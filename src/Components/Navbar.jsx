import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Menu from "@mui/material/Menu";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import HistoryIcon from "@mui/icons-material/History";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { UseChatContext } from "../Context/ChatContext";
import { exportChatAsFile } from "../chatConstants";

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
  renameChat,
  pinChat,
  isMobile,
  formatDate,
}) => {
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const isActive = currentChatId === chat.id;

  const handleSaveRename = (e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameChat(chat.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveRename(e);
    } else if (e.key === "Escape") {
      setEditTitle(chat.title);
      setIsEditing(false);
    }
  };

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        p: 1.25,
        mb: 0.75,
        borderRadius: "12px",
        cursor: "pointer",
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
            : chat.pinned
            ? isDark
              ? "rgba(255, 215, 0, 0.3)"
              : "rgba(255, 170, 0, 0.4)"
            : isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.05)"
        }`,
        transform: hovered ? "translateX(3px)" : "translateX(0)",
      }}
      onClick={() => {
        if (!isEditing) loadChat(chat.id, isMobile);
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        {chat.pinned ? (
          <PushPinIcon
            sx={{
              fontSize: 14,
              mt: 0.3,
              color: "#f59e0b",
              flexShrink: 0,
              transform: "rotate(45deg)",
            }}
          />
        ) : (
          <ChatBubbleOutlineIcon
            sx={{
              fontSize: 14,
              mt: 0.3,
              color: isActive ? "primary.main" : "text.disabled",
              flexShrink: 0,
            }}
          />
        )}

        <Box sx={{ flex: 1, overflow: "hidden" }}>
          {isEditing ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TextField
                size="small"
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  "& .MuiInputBase-input": {
                    py: 0.25,
                    px: 0.75,
                    fontSize: "0.8rem",
                    bgcolor: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.8)",
                    borderRadius: "6px",
                  },
                }}
              />
              <IconButton size="small" onClick={handleSaveRename}>
                <CheckIcon sx={{ fontSize: 14, color: "success.main" }} />
              </IconButton>
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{
                fontWeight: chat.pinned ? 700 : 600,
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: isActive ? "primary.main" : "text.primary",
              }}
            >
              {chat.title}
            </Typography>
          )}

          <Typography
            variant="caption"
            sx={{
              color: "text.disabled",
              fontSize: "0.68rem",
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mt: 0.25,
            }}
          >
            {chat.lastMessage || "No messages"}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: "text.disabled",
              fontSize: "0.62rem",
              mt: 0.25,
              display: "block",
            }}
          >
            {formatDate(chat.timestamp)}
          </Typography>
        </Box>

        {/* Action Menu Trigger */}
        {!isEditing && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              opacity: hovered || Boolean(menuAnchor) ? 1 : 0,
              transition: "opacity 0.2s",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ p: 0.25, color: "text.secondary" }}
            >
              <MoreVertIcon sx={{ fontSize: 16 }} />
            </IconButton>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              PaperProps={{
                sx: {
                  borderRadius: "12px",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)",
                },
              }}
            >
              <MenuItem
                dense
                onClick={() => {
                  pinChat(chat.id);
                  setMenuAnchor(null);
                }}
              >
                {chat.pinned ? (
                  <PushPinOutlinedIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                ) : (
                  <PushPinIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                )}
                {chat.pinned ? "Unpin Chat" : "Pin to Top"}
              </MenuItem>

              <MenuItem
                dense
                onClick={() => {
                  setIsEditing(true);
                  setMenuAnchor(null);
                }}
              >
                <EditIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                Rename
              </MenuItem>

              <MenuItem
                dense
                onClick={() => {
                  exportChatAsFile(chat, "markdown");
                  setMenuAnchor(null);
                }}
              >
                <DownloadIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                Export (Markdown)
              </MenuItem>

              <MenuItem
                dense
                onClick={() => {
                  exportChatAsFile(chat, "json");
                  setMenuAnchor(null);
                }}
              >
                <DownloadIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                Export (JSON)
              </MenuItem>

              <MenuItem
                dense
                onClick={() => {
                  deleteChat(chat.id);
                  setMenuAnchor(null);
                }}
                sx={{ color: "error.main" }}
              >
                <DeleteForeverIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                Delete
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────
// ChatNavbar
// ─────────────────────────────────────────────
const ChatNavbar = ({ isMobile }) => {
  const { state, actions } = UseChatContext();
  const { mode, chatHistory, currentChatId, open, searchQuery, settings } = state;
  const {
    toggleTheme,
    startNewChat,
    clearAllChats,
    loadChat,
    deleteChat,
    renameChat,
    pinChat,
    setOpen,
    setSearchQuery,
    setSettingsOpen,
  } = actions;

  const isDark = mode === "dark";
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((nowOnly - dateOnly) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Filter & sort chat history (pinned first, then date)
  const filteredChats = chatHistory
    .filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

  const navbarItems = [
    {
      name: "New Chat",
      icon: <CreateIcon fontSize="small" />,
      action: () => {
        startNewChat();
        if (isMobile) setOpen(false);
      },
    },
    {
      name: "Clear All",
      icon: <DeleteForeverIcon fontSize="small" />,
      action: () => setConfirmClearOpen(true),
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

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && !open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            top: 14,
            left: 14,
            zIndex: 500,
            bgcolor: isDark ? "rgba(24,26,31,0.92)" : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            "&:hover": { bgcolor: "primary.main", color: "#fff" },
            transition: "all 0.2s",
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      )}

      {/* Mobile Backdrop */}
      {isMobile && open && (
        <Box
          onClick={() => setOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
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
          py: 2,
          bgcolor: isDark ? "rgba(18,20,24,0.96)" : "rgba(248,250,252,0.96)",
          backdropFilter: "blur(20px)",
          ...(!isMobile
            ? {
                minWidth: open ? "280px" : "60px",
                maxWidth: open ? "280px" : "60px",
                width: open ? "280px" : "60px",
              }
            : {
                width: open ? "min(85vw, 320px)" : "0px",
                minWidth: 0,
              }),
          overflow: "hidden",
          transition:
            "width 0.35s cubic-bezier(0.4,0,0.2,1), min-width 0.35s cubic-bezier(0.4,0,0.2,1), max-width 0.35s cubic-bezier(0.4,0,0.2,1)",
          borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          zIndex: 400,
          position: isMobile ? "fixed" : "relative",
          height: "100vh",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          boxShadow: isMobile && open ? "4px 0 32px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <Box
          sx={{
            width: !isMobile ? "280px" : "min(85vw, 320px)",
            minWidth: !isMobile ? "280px" : "min(85vw, 320px)",
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
              mb: 2,
              minHeight: 44,
            }}
          >
            <Box
              onClick={() => setOpen(!open)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              {/* Logo */}
              <Box
                sx={{
                  minWidth: 34,
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #009dd2, #0a3fff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "17px",
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
                  fontSize: "1.15rem",
                  background: "linear-gradient(135deg, #009dd2, #0a3fff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  opacity: open ? 1 : 0,
                  maxWidth: open ? "200px" : "0px",
                  transition: "opacity 0.25s, max-width 0.25s",
                  whiteSpace: "nowrap",
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
                transition: "opacity 0.2s",
                "&:hover": { transform: "rotate(90deg)" },
              }}
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Nav Items */}
          <Box sx={{ px: 1 }}>
            {navbarItems.map((item, index) => (
              <Tooltip key={index} title={!open ? item.name : ""} placement="right" arrow>
                <MenuItem
                  sx={{
                    borderRadius: "12px",
                    mb: 0.5,
                    py: 1,
                    px: open ? 2 : 1.25,
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
                    minHeight: 40,
                  }}
                  onClick={item.action}
                >
                  {item.icon}

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      opacity: open ? 1 : 0,
                      maxWidth: open ? "180px" : "0px",
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

          {/* Search Input when sidebar is open */}
          {open && (
            <Box sx={{ px: 1.5, mt: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ fontSize: 16, mr: 0.75, opacity: 0.5 }} />,
                  sx: {
                    borderRadius: "10px",
                    fontSize: "0.78rem",
                    bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    "& input": { py: 0.75 },
                  },
                }}
              />
            </Box>
          )}

          {/* Divider */}
          <Box
            sx={{
              mx: 2,
              my: 1,
              height: "1px",
              bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
            }}
          />

          {/* Chat History List */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: open ? "auto" : "hidden",
              overflowX: "hidden",
              opacity: open ? 1 : 0,
              transition: "opacity 0.25s",
              px: 1,
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": {
                background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                borderRadius: "2px",
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "text.secondary",
                fontWeight: 700,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                fontSize: "0.65rem",
                mb: 1,
                px: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <HistoryIcon sx={{ fontSize: 14 }} />
                History
              </Box>
              <Typography variant="caption" sx={{ fontSize: "0.65rem", opacity: 0.6 }}>
                {filteredChats.length}
              </Typography>
            </Typography>

            {filteredChats.length === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  color: "text.disabled",
                  textAlign: "center",
                  py: 4,
                  fontSize: "0.8rem",
                }}
              >
                {searchQuery ? "No matches found" : "No conversations yet"}
              </Typography>
            ) : (
              filteredChats.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  chat={chat}
                  currentChatId={currentChatId}
                  isDark={isDark}
                  open={open}
                  loadChat={loadChat}
                  deleteChat={deleteChat}
                  renameChat={renameChat}
                  pinChat={pinChat}
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
              my: 1,
              height: "1px",
              bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
            }}
          />

          {/* Settings & Model Tag */}
          <Box sx={{ px: 1, pb: 1 }}>
            <Tooltip title={!open ? "Settings" : ""} placement="right">
              <MenuItem
                sx={{
                  borderRadius: "12px",
                  py: 1,
                  px: open ? 1.5 : 1,
                  justifyContent: "flex-start",
                  gap: 1.5,
                  "&:hover": {
                    bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                  },
                  transition: "all 0.2s",
                }}
                onClick={() => setSettingsOpen(true)}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: "linear-gradient(135deg, #009dd2, #0a3fff)",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  <SettingsIcon sx={{ fontSize: 18 }} />
                </Avatar>

                <Box
                  sx={{
                    opacity: open ? 1 : 0,
                    maxWidth: open ? "180px" : "0px",
                    transition: "opacity 0.25s, max-width 0.25s",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  <Typography variant="body2" fontWeight={700} fontSize="0.825rem">
                    Settings & Keys
                  </Typography>
                  <Typography
                    variant="caption"
                    color="primary.main"
                    fontSize="0.68rem"
                    fontWeight={600}
                    sx={{ display: "block" }}
                  >
                    {settings.model || "gemini-2.5-flash"}
                  </Typography>
                </Box>
              </MenuItem>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            bgcolor: isDark ? "#181a1f" : "#ffffff",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Clear All Conversations?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove all your saved chat conversations from this device. Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmClearOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              clearAllChats();
              setConfirmClearOpen(false);
            }}
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Clear Everything
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatNavbar;
