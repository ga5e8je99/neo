import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ThinkingBox = ({ thinking = "", isDark = true }) => {
  const [expanded, setExpanded] = useState(false);

  if (!thinking) return null;

  return (
    <Box
      sx={{
        mb: 2,
        borderRadius: "12px",
        overflow: "hidden",
        border: `1px solid ${isDark ? "rgba(147, 112, 219, 0.25)" : "rgba(147, 112, 219, 0.2)"}`,
        bgcolor: isDark ? "rgba(147, 112, 219, 0.06)" : "rgba(147, 112, 219, 0.04)",
      }}
    >
      {/* Header */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 0.75,
          cursor: "pointer",
          userSelect: "none",
          "&:hover": {
            bgcolor: isDark ? "rgba(147, 112, 219, 0.12)" : "rgba(147, 112, 219, 0.08)",
          },
          transition: "background 0.2s ease",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PsychologyIcon
            sx={{
              fontSize: 18,
              color: "#a78bfa",
              animation: "pulse 2s infinite ease-in-out",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.5px",
              color: isDark ? "#c4b5fd" : "#7c3aed",
              fontSize: "0.8rem",
            }}
          >
            Thinking Process
          </Typography>
        </Box>

        <IconButton
          size="small"
          sx={{
            p: 0.25,
            color: isDark ? "#c4b5fd" : "#7c3aed",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Collapsed/Expanded Content */}
      <Collapse in={expanded}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: `1px dashed ${isDark ? "rgba(147, 112, 219, 0.2)" : "rgba(147, 112, 219, 0.15)"}`,
            fontFamily: "inherit",
            fontSize: "0.825rem",
            lineHeight: 1.65,
            color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.65)",
            whiteSpace: "pre-wrap",
            fontStyle: "italic",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {thinking}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ThinkingBox;
