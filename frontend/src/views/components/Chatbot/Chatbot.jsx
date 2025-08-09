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
  Badge,
  Chip,
} from "@mui/material";
import {
  Send as SendIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled components
const ChatbotContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  zIndex: 9999,
}));

const ChatWindow = styled(Paper)(({ theme }) => ({
  width: 320,
  minHeight: 400,
  maxHeight: 600,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: theme.shadows[10],
  borderRadius: "12px",
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1, 2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const MessageList = styled(List)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
}));

const UserMessage = styled(ListItem)(({ theme }) => ({
  justifyContent: "flex-end",
  padding: theme.spacing(0.5, 1),
  alignItems: "flex-end",
}));

const BotMessage = styled(ListItem)(({ theme }) => ({
  justifyContent: "flex-start",
  padding: theme.spacing(0.5, 1),
  alignItems: "flex-start",
}));

const MessageContent = styled(Box)(({ theme }) => ({
  maxWidth: "85%",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
}));

const MessageBubble = styled(Box)(({ theme, sender }) => ({
  backgroundColor:
    sender === "user" ? theme.palette.primary.main : theme.palette.grey[200],
  color:
    sender === "user"
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
  padding: theme.spacing(1, 1.5),
  borderRadius: sender === "user" ? "18px 18px 0 18px" : "18px 18px 18px 0",
  fontSize: "0.875rem",
  lineHeight: 1.4,
  wordBreak: "break-word",
}));

const MessageImage = styled("img")(({ theme }) => ({
  maxWidth: "100%",
  maxHeight: 150,
  borderRadius: "8px",
  cursor: "pointer",
  "&:hover": {
    opacity: 0.9,
  },
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi there! I'm your AI assistant. How can I help?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const toggleChat = () => {
    setOpen(!open);
    if (!open) {
      setUnreadCount(0);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "" && !imagePreview) return;

    // Add user message
    const userMessage = {
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
      image: imagePreview,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setImagePreview(null);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponses = [
        "I've received your message. Let me process that...",
        "Thanks for sharing that with me! Here's what I found...",
        "I'm looking into your request now...",
        "That's interesting! Here's some information...",
        "I've noted your question. Here's what I can tell you...",
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
    }, 800);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview(event.target.result);
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const removeImagePreview = () => {
    setImagePreview(null);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ChatbotContainer>
      {open && (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
          <ChatWindow>
            <ChatHeader>
              <Box display="flex" alignItems="center" gap={1}>
                <BotIcon fontSize="small" />
                <Typography variant="subtitle1">AI Assistant</Typography>
              </Box>
              <IconButton
                edge="end"
                color="inherit"
                onClick={toggleChat}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </ChatHeader>

            <MessageList>
              {messages.map((message, index) => (
                <React.Fragment key={index}>
                  {message.sender === "user" ? (
                    <UserMessage>
                      <MessageContent>
                        {message.image && (
                          <MessageImage
                            src={message.image}
                            alt="User uploaded"
                            style={{
                              maxHeight: 60,
                              alignSelf: "flex-end",
                            }}
                          />
                        )}
                        {message.text && (
                          <MessageBubble sender="user">
                            {message.text}
                          </MessageBubble>
                        )}
                      </MessageContent>
                      <ListItemAvatar sx={{ minWidth: 32 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <UserIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                    </UserMessage>
                  ) : (
                    <BotMessage>
                      <ListItemAvatar sx={{ minWidth: 32 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "primary.main",
                          }}
                        >
                          <BotIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <MessageContent>
                        <MessageBubble sender="bot">
                          {message.text}
                        </MessageBubble>
                      </MessageContent>
                    </BotMessage>
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </MessageList>

            <ChatInput component="form" onSubmit={handleSendMessage}>
              {imagePreview && (
                <Box
                  sx={{
                    position: "relative",
                    mb: 1,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Chip
                    label="Remove image"
                    size="small"
                    onDelete={removeImagePreview}
                    deleteIcon={<CloseIcon fontSize="small" />}
                    sx={{
                      position: "absolute",
                      right: 0,
                      top: -30,
                      bgcolor: "background.paper",
                    }}
                  />
                  <MessageImage
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxHeight: 60,
                      alignSelf: "flex-end",
                    }}
                  />
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current.click()}
                >
                  <AttachFileIcon fontSize="small" />
                </IconButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPaste={handlePaste}
                  size="small"
                  InputProps={{
                    sx: { fontSize: "0.875rem" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          color="primary"
                          type="submit"
                          disabled={inputValue.trim() === "" && !imagePreview}
                          size="small"
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </ChatInput>
          </ChatWindow>
        </Slide>
      )}
      <Box display={"flex"} justifyContent={"flex-end"} mt={2}>
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
              width: 48,
              height: 48,
            }}
          >
            {open ? (
              <CloseIcon fontSize="small" />
            ) : (
              <ChatIcon fontSize="small" />
            )}
          </IconButton>
        </Badge>
      </Box>
    </ChatbotContainer>
  );
};

export default Chatbot;
