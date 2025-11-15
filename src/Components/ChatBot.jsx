import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function ChatBot() {
  const [messages, setMessages] = useState([{}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCdkXVUDA6FETFiTfpCiZ0Pg69F-JnQRKI",
        {
          contents: [{ parts: [{ text: input }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const botReply =
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ Sorry, I didn’t understand that.";

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error connecting to the Gemini API." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "#f9fafb",
      }}
    >
      {/* Chat Messages */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {messages.map((msg, index) =>
          msg.text !== undefined ? (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: "75%",
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.sender === "user" ? "#1976d2" : "#e0e0e0",
                color: msg.sender === "user" ? "white" : "black",
                borderRadius: 3,
                wordBreak: "break-word",
              }}
            >
              <Typography variant="body1">{msg.text}</Typography>
              {console.log(msg.text)}
            </Paper>
          ) : (
            <Box>HI</Box>
          )
        )}
        {loading && (
          <Typography sx={{ color: "gray", fontStyle: "italic", mt: 1 }}>
            🤖 Gemini is thinking...
          </Typography>
        )}
      </Box>

      {/* Input Area */}
      <Card
        sx={{
          borderTop: "1px solid #ccc",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <TextField
          className="input"
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={loading}
            sx={{ p: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </CardContent>
      </Card>
    </Box>
  );
}
