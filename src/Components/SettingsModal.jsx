import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StorageIcon from "@mui/icons-material/Storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { UseChatContext } from "../Context/ChatContext";
import { testGeminiApiKey } from "../services/aiService";

const SettingsModal = () => {
  const { state, actions } = UseChatContext();
  const { settings, settingsOpen, mode, chatHistory } = state;
  const { updateSettings, setSettingsOpen, clearAllChats } = actions;
  const isDark = mode === "dark";

  const [activeTab, setActiveTab] = useState(0);
  const [localSettings, setLocalSettings] = useState(settings);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showHfKey, setShowHfKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync when opened
  React.useEffect(() => {
    if (settingsOpen) {
      setLocalSettings(settings);
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [settingsOpen, settings]);

  const handleTestKey = async () => {
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await testGeminiApiKey(localSettings.geminiApiKey);
      setTestResult(res);
    } catch (e) {
      setTestResult({ valid: false, error: e.message });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSettingsOpen(false);
    }, 800);
  };

  const handleExportAll = () => {
    const data = JSON.stringify(chatHistory, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neochat_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          localStorage.setItem("neoChatHistory", JSON.stringify(imported));
          window.location.reload();
        } else {
          alert("Invalid backup file format.");
        }
      } catch {
        alert("Error parsing JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const systemPromptPresets = [
    { label: "Senior Developer", text: "You are a senior full-stack software engineer. Provide clean, secure, performant, and well-commented code with modern best practices." },
    { label: "Analytical Scholar", text: "You are an analytical researcher. Break down concepts from first principles, citing structured frameworks and evaluating pros and cons." },
    { label: "Arabic Linguist", text: "أنت مساعد ذكي ومتحدث باللغة العربية الفصحى البليغة. اشرح المفاهيم بوضوح ودقة عالية." },
    { label: "Concise Assistant", text: "Be extremely concise, direct, and straightforward. Skip fluff, introductory phrases, and unnecessary conclusions." },
  ];

  return (
    <Dialog
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          bgcolor: isDark ? "#181a1f" : "#ffffff",
          backgroundImage: "none",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        }}
      >
        <Typography variant="h6" fontWeight={800} fontSize="1.15rem">
          Settings & Customization
        </Typography>
        <IconButton size="small" onClick={() => setSettingsOpen(false)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="fullWidth"
        sx={{
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          minHeight: 48,
          "& .MuiTab-root": {
            fontSize: "0.85rem",
            fontWeight: 700,
            textTransform: "none",
            gap: 1,
            minHeight: 48,
          },
        }}
      >
        <Tab icon={<VpnKeyIcon sx={{ fontSize: 18 }} />} label="API Keys" />
        <Tab icon={<SmartToyIcon sx={{ fontSize: 18 }} />} label="Model & Persona" />
        <Tab icon={<VolumeUpIcon sx={{ fontSize: 18 }} />} label="Voice & Sound" />
        <Tab icon={<StorageIcon sx={{ fontSize: 18 }} />} label="Data" />
      </Tabs>

      <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* TAB 0: API KEYS */}
        {activeTab === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Alert severity="info" sx={{ borderRadius: "12px", fontSize: "0.825rem" }}>
              Google Gemini keys are <strong>100% Free</strong> from Google AI Studio. Get your instant key to activate all features!
            </Alert>

            {/* Gemini API Key */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Google Gemini API Key
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  type={showGeminiKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={localSettings.geminiApiKey || ""}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })
                  }
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        size="small"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                      >
                        {showGeminiKey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  disabled={testingKey || !localSettings.geminiApiKey}
                  onClick={handleTestKey}
                  sx={{ borderRadius: "10px", minWidth: 90 }}
                >
                  {testingKey ? <CircularProgress size={18} /> : "Test Key"}
                </Button>
              </Box>

              {testResult && (
                <Alert
                  severity={testResult.valid ? "success" : "error"}
                  sx={{ mt: 1, borderRadius: "10px", fontSize: "0.8rem" }}
                >
                  {testResult.valid
                    ? "Key verified successfully! Ready to connect."
                    : testResult.error}
                </Alert>
              )}

              <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  startIcon={<OpenInNewIcon fontSize="inherit" />}
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontSize: "0.75rem", textTransform: "none" }}
                >
                  Get a Free Gemini Key (Google AI Studio)
                </Button>
              </Box>
            </Box>

            {/* Hugging Face Key */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Hugging Face Token (Optional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showHfKey ? "text" : "password"}
                placeholder="hf_..."
                value={localSettings.hfApiKey || ""}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, hfApiKey: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowHfKey(!showHfKey)}
                    >
                      {showHfKey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Box>
          </Box>
        )}

        {/* TAB 1: MODEL & PERSONA */}
        {activeTab === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Default AI Model</InputLabel>
              <Select
                value={localSettings.model || "gemini-2.5-flash"}
                label="Default AI Model"
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, model: e.target.value })
                }
                sx={{ borderRadius: "10px" }}
              >
                <MenuItem value="gemini-2.5-flash">
                  Gemini 2.5 Flash (Ultra-fast, Multimodal & Reasoning)
                </MenuItem>
                <MenuItem value="gemini-2.0-flash">
                  Gemini 2.0 Flash (Fast & Capable)
                </MenuItem>
                <MenuItem value="gemini-1.5-flash">
                  Gemini 1.5 Flash (Lightweight)
                </MenuItem>
                <MenuItem value="gemini-1.5-pro">
                  Gemini 1.5 Pro (Deep Analytics & Long Context)
                </MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: "block" }}>
                Temperature / Creativity: {localSettings.temperature ?? 0.7}
              </Typography>
              <Slider
                value={localSettings.temperature ?? 0.7}
                min={0.1}
                max={1.0}
                step={0.1}
                onChange={(_, val) => setLocalSettings({ ...localSettings, temperature: val })}
                sx={{ color: "primary.main" }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Custom System Persona / Instruction
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="e.g. You are an expert AI mentor who always provides insightful, structured answers..."
                value={localSettings.systemPrompt || ""}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, systemPrompt: e.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />

              {/* Presets */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {systemPromptPresets.map((preset, idx) => (
                  <Button
                    key={idx}
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      setLocalSettings({ ...localSettings, systemPrompt: preset.text })
                    }
                    sx={{
                      borderRadius: "8px",
                      fontSize: "0.72rem",
                      textTransform: "none",
                      py: 0.25,
                      px: 1,
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* TAB 2: VOICE & AUDIO */}
        {activeTab === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Speech Recognition Language</InputLabel>
              <Select
                value={localSettings.speechLang || "auto"}
                label="Speech Recognition Language"
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, speechLang: e.target.value })
                }
                sx={{ borderRadius: "10px" }}
              >
                <MenuItem value="auto">Auto Detect (Browser Default)</MenuItem>
                <MenuItem value="ar-SA">Arabic (العربية - السعودية / الشرق الأوسط)</MenuItem>
                <MenuItem value="ar-EG">Arabic (العربية - مصر)</MenuItem>
                <MenuItem value="en-US">English (US)</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.soundEnabled ?? true}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })
                  }
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Sound Effects
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Subtle audio cues when sending and receiving messages
                  </Typography>
                </Box>
              }
            />
          </Box>
        )}

        {/* TAB 3: DATA & BACKUP */}
        {activeTab === 3 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Saved Chats: <strong>{chatHistory.length}</strong>
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleExportAll}
                sx={{ borderRadius: "10px", textTransform: "none" }}
              >
                Export Backup (JSON)
              </Button>

              <Button
                variant="outlined"
                size="small"
                component="label"
                sx={{ borderRadius: "10px", textTransform: "none" }}
              >
                Restore Backup
                <input type="file" accept=".json" hidden onChange={handleImportFile} />
              </Button>
            </Box>

            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
              <Button
                color="error"
                variant="outlined"
                size="small"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all conversations?")) {
                    clearAllChats();
                  }
                }}
                sx={{ borderRadius: "10px", textTransform: "none" }}
              >
                Clear All Conversations
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box>
          {savedSuccess && (
            <Typography
              variant="caption"
              color="success.main"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700 }}
            >
              <CheckCircleIcon fontSize="inherit" /> Settings saved!
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="text"
            onClick={() => setSettingsOpen(false)}
            sx={{ borderRadius: "10px", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: "10px",
              background: "linear-gradient(135deg, #009dd2, #0a3fff)",
              textTransform: "none",
              px: 3,
            }}
          >
            Save Changes
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;
