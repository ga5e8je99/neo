import React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChatNavbar from './Components/Navbar';
import ChatArea from './Components/ChatArea';
import { UseChatContext } from './Context/ChatContext';

export default function ChatBot() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { state } = UseChatContext();
  const { open } = state;

  return (
    <Box sx={{ height: "100vh", display: "flex", width: "100vw" }}>
      <ChatNavbar isMobile={isMobile} />
      <ChatArea isMobile={isMobile} open={open} />
    </Box>
  );
}