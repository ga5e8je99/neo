import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
// Popular language components
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markdown";

const CodeBlock = ({ language = "javascript", value = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHighlightedCode = () => {
    const lang = (language || "javascript").toLowerCase();
    const grammar = Prism.languages[lang] || Prism.languages.javascript || Prism.languages.clike;
    try {
      return Prism.highlight(value, grammar, lang);
    } catch {
      return value;
    }
  };

  return (
    <Box
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        my: 1.5,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        bgcolor: "#181a1f",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Code Header Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 0.75,
          bgcolor: "#21252b",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            color: "#61afef",
            fontSize: "0.75rem",
          }}
        >
          {language || "code"}
        </Typography>

        <Tooltip title={copied ? "Copied!" : "Copy Code"}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              color: copied ? "#98c379" : "#abb2bf",
              p: 0.5,
              fontSize: "0.8rem",
              gap: 0.5,
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            {copied ? (
              <CheckIcon sx={{ fontSize: 16 }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 16 }} />
            )}
            <Typography variant="caption" sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
              {copied ? "Copied" : "Copy"}
            </Typography>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Code Area */}
      <Box
        component="pre"
        sx={{
          p: 2,
          m: 0,
          overflowX: "auto",
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Monaco, monospace",
          fontSize: { xs: "0.8rem", sm: "0.875rem" },
          lineHeight: 1.6,
          bgcolor: "transparent !important",
          color: "#abb2bf",
          "& code": {
            fontFamily: "inherit !important",
            bgcolor: "transparent !important",
            p: 0,
          },
        }}
      >
        <code
          className={`language-${language || "javascript"}`}
          dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
        />
      </Box>
    </Box>
  );
};

export default CodeBlock;
