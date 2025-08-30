import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  styled,
  Alert,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import { stubCreationAgent } from "../../../core/api/stub";
import { useNavigate } from "react-router-dom";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: "70vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: "#f8f9fa",
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#c1c1c1",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#a8a8a8",
  },
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  display: "flex",
  justifyContent: isUser ? "flex-end" : "flex-start",
  alignItems: "flex-start",
  gap: theme.spacing(1),
}));

const MessageContent = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(1.5, 2),
  maxWidth: "75%",
  backgroundColor: isUser ? theme.palette.primary.main : "#ffffff",
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
  wordBreak: "break-word",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  "& p": {
    margin: "8px 0",
    "&:first-of-type": {
      marginTop: 0,
    },
    "&:last-of-type": {
      marginBottom: 0,
    },
  },
  "& ul, & ol": {
    margin: "8px 0",
    paddingLeft: "20px",
  },
  "& li": {
    margin: "4px 0",
  },
  "& strong": {
    fontWeight: 600,
  },
  "& em": {
    fontStyle: "italic",
  },
  "& code": {
    backgroundColor: isUser ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
    padding: "2px 4px",
    borderRadius: "4px",
    fontSize: "0.9em",
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: "#ffffff",
}));

const SuggestionsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: "flex",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: "#ffffff",
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  marginBottom: theme.spacing(1),
}));

const WelcomeMessage = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
}));

const AddNewStub = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const suggestions = [
    "Upload a stub image to get started",
    "All set, create my stub",
    "Tell me more about my stub",
    "What's the estimated value?",
    "Describe the event details",
    "What venue information do you see?",
    "When is this event?",
    "Help me understand the ticket details"
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading]);

  // Initialize with welcome message
  useEffect(() => {
    setChatMessages([
      {
        id: 1,
        isUser: false,
        content: "👋 **Welcome to Stub Collector!**\n\nI'm here to help you create and analyze your ticket stubs. You can:\n\n• **Upload an image** of your ticket stub\n• **Ask questions** about your stub\n• **Get detailed analysis** of event information\n• **Create listings** for your stubs\n\nTo get started, simply upload an image of your stub or ask me anything!",
        timestamp: new Date().toISOString(),
        isWelcome: true,
      }
    ]);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Maximum size is 5MB");
        return;
      }

      // Check file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Allowed types: PNG, JPG, JPEG");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatMessageContent = (content) => {
    // Convert markdown-like formatting to JSX
    const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      } else if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index}>{part.slice(1, -1)}</code>;
      } else {
        // Handle line breaks
        return part.split('\n').map((line, lineIndex, arr) => (
          <React.Fragment key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < arr.length - 1 && <br />}
          </React.Fragment>
        ));
      }
    });
  };

  const sendMessage = async (message = inputMessage, file = selectedFile) => {
    if (!message.trim() && !file) return;

    // Create user message
    const userMessage = {
      id: Date.now(),
      isUser: true,
      content: message || (file ? "🖼️ *[Image uploaded]*" : ""),
      timestamp: new Date().toISOString(),
      hasImage: !!file,
      imagePreview: file ? filePreview : null,
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Clear file selection after sending
    if (file) {
      removeSelectedFile();
    }

    try {
      const formData = new FormData();
      if (file) {
        formData.append("image", file);
      }
      formData.append("query", message || "Please analyze this image");

      const response = await stubCreationAgent(formData);
      
      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          isUser: false,
          content: response.data.response,
          timestamp: new Date().toISOString(),
        };

        setChatMessages(prev => [...prev, botMessage]);

        // Check if stub was created and navigate
        if (response.data.stub_created && response.data.stub_id) {
          setSuccess("🎉 Stub created successfully! Redirecting to preview...");
          
          // Navigate to stub preview page
          setTimeout(() => {
            navigate(`/stub-preview/${response.data.stub_id}`);
          }, 2000);
        }
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        isUser: false,
        content: `❌ **Error:** ${error.response?.data?.message || "Failed to process request"}`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === "Upload a stub image to get started") {
      fileInputRef.current?.click();
    } else {
      sendMessage(suggestion);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 900,
        m: "auto",
        mt: 3,
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h4" component="h1" gutterBottom>
            💬 Stub Creator Chat
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload your ticket stub and chat with our AI to create your listing
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ m: 2 }}>
            {success}
          </Alert>
        )}

        {/* Chat Interface */}
        <ChatContainer elevation={0}>
          <MessagesContainer>
            {chatMessages.map((message) => (
              <MessageBubble key={message.id} isUser={message.isUser}>
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: message.isUser ? "primary.main" : "grey.300"
                  }}
                >
                  {message.isUser ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <MessageContent isUser={message.isUser}>
                  {message.hasImage && message.imagePreview && (
                    <Box sx={{ mb: 1 }}>
                      <img
                        src={message.imagePreview}
                        alt="Uploaded stub"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "150px",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  )}
                  <Typography variant="body1" component="div">
                    {formatMessageContent(message.content)}
                  </Typography>
                </MessageContent>
              </MessageBubble>
            ))}
            
            {isLoading && (
              <MessageBubble isUser={false}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: "grey.300" }}>
                  <SmartToyIcon />
                </Avatar>
                <MessageContent isUser={false}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body1">
                      Analyzing your stub...
                    </Typography>
                  </Box>
                </MessageContent>
              </MessageBubble>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          {/* Suggestions */}
          <SuggestionsContainer>
            <Typography variant="body2" sx={{ color: "text.secondary", mr: 1 }}>
              💡 Quick actions:
            </Typography>
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                variant="outlined"
                size="small"
                sx={{ 
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "primary.light",
                    color: "white",
                  }
                }}
                disabled={isLoading}
              />
            ))}
          </SuggestionsContainer>

          {/* Input Container */}
          <InputContainer>
            {/* File Preview */}
            {filePreview && (
              <ImagePreview>
                <Paper sx={{ p: 1, mb: 1, display: "inline-block" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <img
                      src={filePreview}
                      alt="Preview"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {selectedFile?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={removeSelectedFile}
                      sx={{ ml: 1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </ImagePreview>
            )}

            {/* Input Row */}
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message or upload an image..."
                disabled={isLoading}
                variant="outlined"
                size="small"
              />
              
              <IconButton
                component="label"
                disabled={isLoading}
                sx={{ 
                  bgcolor: "grey.100",
                  "&:hover": { bgcolor: "grey.200" }
                }}
              >
                <ImageIcon />
                <VisuallyHiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                />
              </IconButton>

              <IconButton
                onClick={() => sendMessage()}
                disabled={isLoading || (!inputMessage.trim() && !selectedFile)}
                color="primary"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": { bgcolor: "grey.300" }
                }}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </InputContainer>
        </ChatContainer>
      </CardContent>
    </Card>
  );
};

export default AddNewStub;
