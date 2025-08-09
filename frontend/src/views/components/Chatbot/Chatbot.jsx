import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Slide,
  Fade,
  Badge,
} from "@mui/material";
import {
  Send as SendIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled components
const ChatbotContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(5),
  right: theme.spacing(5),
  zIndex: 9999,
}));

const ChatWindow = styled(Paper)(({ theme }) => ({
  width: 350,
  minHeight: 400,
  maxHeight: 700,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: theme.shadows[10],
  borderRadius: "12px",
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const MessageList = styled(List)({
  flex: 1,
  overflowY: "auto",
  padding: 0,
  backgroundColor: "#f5f5f5",
});

const UserMessage = styled(ListItem)(({ theme }) => ({
  justifyContent: "flex-end",
  paddingRight: theme.spacing(2),
}));

const BotMessage = styled(ListItem)(({ theme }) => ({
  justifyContent: "flex-start",
  paddingLeft: theme.spacing(2),
}));

const MessageText = styled(ListItemText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1, 2),
    borderRadius: "18px",
    display: "inline-block",
    maxWidth: "70%",
    fontSize: "0.8rem",
  },
}));

const BotMessageText = styled(MessageText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setOpen(!open);
    if (!open) {
      setUnreadCount(0);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    // Add user message
    const userMessage = {
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponses = [
        "I understand your question. Let me look that up for you.",
        "That's an interesting point. Here's what I found...",
        "Thanks for your message. I'm processing your request.",
        "I'm still learning. Can you rephrase your question?",
        "Here's some information that might help with your query.",
      ];
      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];

      const botMessage = {
        text: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      if (!open) {
        setUnreadCount((prev) => prev + 1);
      }
    }, 1000);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close chat when clicking outside (optional)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // You can implement this if you want clicks outside to close the chat
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <ChatbotContainer>
      {open && (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
          <ChatWindow>
            <ChatHeader>
              <Box display="flex" alignItems="center">
                <BotIcon sx={{ mr: 1 }} />
                <Typography variant="h6">AI Assistant</Typography>
              </Box>
              <IconButton
                edge="end"
                color="inherit"
                onClick={toggleChat}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </ChatHeader>

            <MessageList>
              {messages.map((message, index) => (
                <React.Fragment key={index}>
                  {message.sender === "user" ? (
                    <UserMessage>
                      <MessageText
                        primary={message.text}
                        // secondary={message.timestamp.toLocaleTimeString([], {
                        //   hour: "2-digit",
                        //   minute: "2-digit",
                        // })}
                      />
                      <ListItemAvatar sx={{ minWidth: 45 }}>
                        <Avatar>
                          <UserIcon />
                        </Avatar>
                      </ListItemAvatar>
                    </UserMessage>
                  ) : (
                    <BotMessage>
                      <ListItemAvatar sx={{ minWidth: 45 }}>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <BotIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <BotMessageText
                        primary={message.text}
                        // secondary={message.timestamp.toLocaleTimeString([], {
                        //   hour: "2-digit",
                        //   minute: "2-digit",
                        // })}
                      />
                    </BotMessage>
                  )}
                  {index < messages.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </MessageList>

            <ChatInput component="form" onSubmit={handleSendMessage}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        color="primary"
                        type="submit"
                        disabled={inputValue.trim() === ""}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </ChatInput>
          </ChatWindow>
        </Slide>
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Badge
          badgeContent={unreadCount}
          color="error"
          overlap="circular"
          invisible={unreadCount === 0}
        >
          <IconButton
            color="primary"
            onClick={toggleChat}
            sx={{
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              width: 56,
              height: 56,
            }}
          >
            {open ? <CloseIcon /> : <ChatIcon />}
          </IconButton>
        </Badge>
      </Box>
    </ChatbotContainer>
  );
};

export default Chatbot;
