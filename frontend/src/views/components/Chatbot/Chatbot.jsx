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
  Chip,
  Badge,
  Slide,
} from "@mui/material";
import {
  Send as SendIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { v4 as uuidv4 } from "uuid"; // ✅ generate unique IDs
import { askChatbot } from "../../../core/api/chatBoard";

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

const UserMessage = styled(ListItem)(() => ({
  justifyContent: "flex-end",
  padding: "4px 8px",
  alignItems: "flex-end",
}));

const BotMessage = styled(ListItem)(() => ({
  justifyContent: "flex-start",
  padding: "4px 8px",
  alignItems: "flex-start",
}));

const MessageContent = styled(Box)(() => ({
  maxWidth: "85%",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
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

const MessageImage = styled("img")(() => ({
  maxWidth: "100%",
  maxHeight: 150,
  borderRadius: "8px",
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

// Chatbot Component
const Chatbot = () => {
  // Inject blinking keyframes for typing dots (only once)
  useEffect(() => {
    if (!document.head.querySelector('style[data-chatbot-blink]')) {
      const style = document.createElement('style');
      style.setAttribute('data-chatbot-blink', 'true');
      style.innerHTML = `
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [animatedBotText, setAnimatedBotText] = useState("");
  const [open, setOpen] = useState(false);
  // Nested state for user and bot messages
  const [chatState, setChatState] = useState({
    userMessages: [],
    botMessages: [
      {
        text: "Hi there! I'm your AI assistant. How can I help?",
        sender: "bot",
        timestamp: new Date(),
      },
    ],
  });
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [questionId, setQuestionId] = useState(""); // ✅ new state for ID
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Generate a unique question ID when component mounts
  useEffect(() => {
    const newId = uuidv4();
    setQuestionId(newId);
    console.log("Generated Question ID:", newId);
  }, []);

  const toggleChat = () => {
    setOpen(!open);
    if (!open) setUnreadCount(0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "" && !imageFile) return;

    // Add user message to nested state
    const userMessage = {
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
      image: imagePreview,
    };
    setChatState((prev) => ({
      ...prev,
      userMessages: [...prev.userMessages, userMessage],
    }));

    // Prepare FormData
    const formData = new FormData();
    formData.append("question_id", questionId); // ✅ use generated ID
    formData.append("question", inputValue || "");
    if (imageFile) formData.append("image", imageFile);
  // Only pass userMessages in conversation_history
  const conversation_history = [...chatState.userMessages, userMessage];
  formData.append("conversation_history", JSON.stringify(conversation_history));

    setInputValue("");
    setImageFile(null);
    setImagePreview(null);

    setLoading(true);
    setAnimatedBotText("");
    try {
      const res = await askChatbot(formData);
      const replyText = res.data?.response || "Sorry, I couldn’t understand that.";
      // Handwriting effect: animate bot reply text
      let i = 0;
      setAnimatedBotText("");
      const typeWriter = () => {
        if (i <= replyText.length) {
          setAnimatedBotText(replyText.slice(0, i));
          i++;
          setTimeout(typeWriter, 18); // speed of typing
        } else {
          // Add bot message to chatState after animation
          setChatState((prev) => ({
            ...prev,
            botMessages: [...prev.botMessages, {
              text: replyText,
              sender: "bot",
              timestamp: new Date(),
            }],
          }));
          setLoading(false);
          setAnimatedBotText("");
          if (!open) setUnreadCount((prev) => prev + 1);
        }
      };
      typeWriter();
    } catch (err) {
      console.error("Chatbot API error:", err);
      setChatState((prev) => ({
        ...prev,
        botMessages: [
          ...prev.botMessages,
          { text: "Error connecting to chatbot.", sender: "bot", timestamp: new Date() },
        ],
      }));
      setLoading(false);
      setAnimatedBotText("");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState]);

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
              <IconButton edge="end" color="inherit" onClick={toggleChat} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </ChatHeader>

            {/* Messages */}
            <MessageList>
              {/* Render bot and user messages in order */}
              {[
                ...chatState.botMessages.map((message, index) => ({ ...message, type: "bot", key: `bot-${index}` })),
                ...chatState.userMessages.map((message, index) => ({ ...message, type: "user", key: `user-${index}` })),
              ]
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((message) => (
                  <React.Fragment key={message.key}>
                    {message.type === "user" ? (
                      <UserMessage>
                        <MessageContent>
                          {message.image && (
                            <MessageImage src={message.image} alt="User uploaded" />
                          )}
                          {message.text && (
                            <MessageBubble sender="user">{message.text}</MessageBubble>
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
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                            <BotIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <MessageContent>
                          <MessageBubble sender="bot">{message.text}</MessageBubble>
                        </MessageContent>
                      </BotMessage>
                    )}
                  </React.Fragment>
                ))}
              {/* Loading state for bot reply (handwriting effect) */}
              {loading && (
                <BotMessage>
                  <ListItemAvatar sx={{ minWidth: 32 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                      <BotIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <MessageContent>
                    <MessageBubble sender="bot">
                      {animatedBotText}
                      {!animatedBotText && (
                        <span style={{ fontSize: "1.2em", letterSpacing: 2 }}>
                          <span className="typing-dots">
                            <span style={{ animation: "blink 1s infinite" }}>.</span>
                            <span style={{ animation: "blink 1.2s infinite" }}>.</span>
                            <span style={{ animation: "blink 1.4s infinite" }}>.</span>
                          </span>
                        </span>
                      )}
                    </MessageBubble>
                  </MessageContent>
                </BotMessage>
              )}
              <div ref={messagesEndRef} />
            </MessageList>

            {/* Input */}
            <ChatInput component="form" onSubmit={handleSendMessage}>
              {imagePreview && (
                <Box sx={{ position: "relative", mb: 1 }}>
                  <Chip
                    label="Remove image"
                    size="small"
                    onDelete={removeImagePreview}
                    deleteIcon={<CloseIcon fontSize="small" />}
                    sx={{ position: "absolute", right: 0, top: -30 }}
                  />
                  <MessageImage src={imagePreview} alt="Preview" />
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" onClick={() => fileInputRef.current.click()}>
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
                  size="small"
                  InputProps={{
                    sx: { fontSize: "0.875rem" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          color="primary"
                          type="submit"
                          disabled={inputValue.trim() === "" && !imageFile}
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
              "&:hover": { backgroundColor: "primary.dark" },
              width: 48,
              height: 48,
            }}
          >
            {open ? <CloseIcon fontSize="small" /> : <ChatIcon fontSize="small" />}
          </IconButton>
        </Badge>
      </Box>
    </ChatbotContainer>
  );
};

export default Chatbot;
