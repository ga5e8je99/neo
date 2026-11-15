import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const ImageMessage = ({ imageUrl, prompt = "", isDark = true }) => {
  const [openLightbox, setOpenLightbox] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const cleanPrompt = (prompt || "ai_image")
        .slice(0, 24)
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      a.download = `neochat_${cleanPrompt}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <Box sx={{ my: 1.5, maxWidth: "100%", width: "420px" }}>
      {/* Prompt Badge */}
      {prompt && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            mb: 1,
            px: 1.25,
            py: 0.5,
            borderRadius: "8px",
            bgcolor: isDark ? "rgba(0, 157, 210, 0.15)" : "rgba(0, 157, 210, 0.08)",
            border: `1px solid ${isDark ? "rgba(0, 157, 210, 0.3)" : "rgba(0, 157, 210, 0.2)"}`,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 14, color: "primary.main" }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: isDark ? "#7dd3fc" : "#0284c7",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {prompt}
          </Typography>
        </Box>
      )}

      {/* Image Container with Actions */}
      <Box
        sx={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          bgcolor: isDark ? "#1a1a1a" : "#f0f0f0",
          aspectRatio: "1/1",
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.4)"
            : "0 8px 32px rgba(0,0,0,0.12)",
          "&:hover .image-overlay": {
            opacity: 1,
          },
        }}
      >
        {!imageLoaded && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <CircularProgress size={32} color="primary" />
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Rendering high-resolution image...
            </Typography>
          </Box>
        )}

        <Box
          component="img"
          src={imageUrl}
          alt={prompt || "AI generated image"}
          onLoad={() => setImageLoaded(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            cursor: "pointer",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.02)" },
          }}
          onClick={() => setOpenLightbox(true)}
        />

        {/* Hover Action Bar */}
        <Box
          className="image-overlay"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            opacity: 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <Tooltip title="View Fullscreen">
            <IconButton
              size="small"
              onClick={() => setOpenLightbox(true)}
              sx={{ color: "#fff", bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download Image">
            <IconButton
              size="small"
              onClick={handleDownload}
              sx={{ color: "#fff", bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Lightbox Dialog */}
      <Dialog
        open={openLightbox}
        onClose={() => setOpenLightbox(false)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
            position: "relative",
          },
        }}
      >
        <IconButton
          onClick={() => setOpenLightbox(false)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "#fff",
            bgcolor: "rgba(0,0,0,0.6)",
            zIndex: 10,
            "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          component="img"
          src={imageUrl}
          alt={prompt}
          sx={{
            maxWidth: "90vw",
            maxHeight: "85vh",
            borderRadius: "16px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
            display: "block",
            objectFit: "contain",
          }}
        />
      </Dialog>
    </Box>
  );
};

export default ImageMessage;
