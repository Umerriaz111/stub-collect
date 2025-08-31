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
import BackToMainButton from "../../components/BackToMainButton/BackToMainButton";

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
  backgroundColor: "#fff8f0",
  border: "2px solid rgba(252, 196, 132, 0.3)",
  borderRadius: "16px",
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  background: "linear-gradient(135deg, #fff8f0 0%, #fef5e7 100%)",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(252, 196, 132, 0.1)",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(252, 196, 132, 0.6)",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "rgba(252, 196, 132, 0.8)",
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
  backgroundColor: isUser 
    ? "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)" 
    : "#ffffff",
  background: isUser 
    ? "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)" 
    : "#ffffff",
  color: isUser ? "#ffffff" : theme.palette.text.primary,
  borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
  wordBreak: "break-word",
  boxShadow: isUser 
    ? "0 4px 12px rgba(255, 138, 80, 0.3)" 
    : "0 2px 8px rgba(0,0,0,0.1)",
  border: isUser ? "none" : "1px solid rgba(252, 196, 132, 0.2)",
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
    backgroundColor: isUser ? "rgba(255,255,255,0.25)" : "rgba(252, 196, 132, 0.2)",
    padding: "2px 6px",
    borderRadius: "6px",
    fontSize: "0.9em",
    fontFamily: "monospace",
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid rgba(252, 196, 132, 0.3)`,
  backgroundColor: "#ffffff",
  borderBottomLeftRadius: "16px",
  borderBottomRightRadius: "16px",
}));

const SuggestionsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  display: "flex",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  borderTop: `1px solid rgba(252, 196, 132, 0.2)`,
  backgroundColor: "#fef9f5",
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
  const [typingMessageId, setTypingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingIntervalRef = useRef(null);

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

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

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

  // Typing animation function
  const typeMessage = (messageId, fullContent, onComplete) => {
    let currentIndex = 0;
    setTypingMessageId(messageId);
    
    const typeNextChar = () => {
      if (currentIndex <= fullContent.length) {
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: fullContent.substring(0, currentIndex) }
              : msg
          )
        );
        currentIndex++;
      } else {
        clearInterval(typingIntervalRef.current);
        setTypingMessageId(null);
        if (onComplete) onComplete();
      }
    };

    typingIntervalRef.current = setInterval(typeNextChar, 10); // Adjust speed here (lower = faster)
  };

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

    // Clear any existing typing animation
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      setTypingMessageId(null);
    }

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
        const botMessageId = Date.now() + 1;
        const botMessage = {
          id: botMessageId,
          isUser: false,
          content: "", // Start with empty content
          timestamp: new Date().toISOString(),
        };

        // Add the message to chat first
        setChatMessages(prev => [...prev, botMessage]);
        setIsLoading(false);

        // Start typing animation
        typeMessage(botMessageId, response.data.response, () => {
          // Check if stub was created and navigate after typing is complete
          if (response.data.stub_created && response.data.stub_id) {
            setSuccess("🎉 Stub created successfully! Redirecting to preview...");
            
            // Navigate to stub preview page
            setTimeout(() => {
              navigate(`/stub-preview/${response.data.stub_id}`);
            }, 2000);
          }
        });
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessageId = Date.now() + 1;
      const errorMessage = {
        id: errorMessageId,
        isUser: false,
        content: "",
        timestamp: new Date().toISOString(),
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      
      // Type the error message
      typeMessage(errorMessageId, `❌ **Error:** ${error.response?.data?.message || "Failed to process request"}`);
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
    <Box sx={{ position: "relative", minHeight: "95vh" }}>
      <BackToMainButton
        backgroundColor="rgba(252, 196, 132, 0.9)"
        hoverColor="#ff6b35"
      />
      
      <Card
        sx={{
          maxWidth: 900,
          m: "auto",
          mt: 3,
          mb: 3,
          background: "linear-gradient(135deg, rgba(252, 196, 132, 0.1) 0%, rgba(255, 138, 80, 0.05) 100%)",
          border: "1px solid rgba(252, 196, 132, 0.3)",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(252, 196, 132, 0.2)",
        }}
      >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: 1, 
          borderColor: "rgba(252, 228, 200, 0.62)",
          background: "linear-gradient(135deg, rgba(252, 196, 132, 0.67) 0%, rgba(252, 152, 102, 0.71) 100%)",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{
              background: "linear-gradient(135deg, #fa844aff 0%, #ff6b35 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
            }}
          >
            💬 Stub Creator Chat
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload your ticket stub and chat with our AI to create your listing
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {success  && (
          <Alert severity="success" >
            {success}
          </Alert>
        )}

        {/* Chat Interface */}
        <ChatContainer sx={{borderRadius: "0px 0px 20px 20px"}} elevation={0}>
          <MessagesContainer>
            {chatMessages.map((message) => (
              <MessageBubble key={message.id} isUser={message.isUser}>
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: message.isUser 
                      ? "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)" 
                      : "linear-gradient(135deg, rgba(252, 196, 132, 0.8) 0%, rgba(255, 138, 80, 0.6) 100%)",
                    background: message.isUser 
                      ? "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)" 
                      : "linear-gradient(135deg, rgba(252, 196, 132, 0.8) 0%, rgba(255, 138, 80, 0.6) 100%)",
                    color: "#ffffff",
                    boxShadow: message.isUser 
                      ? "0 4px 12px rgba(255, 138, 80, 0.3)" 
                      : "0 2px 8px rgba(252, 196, 132, 0.3)",
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
                    {typingMessageId === message.id && (
                      <Box 
                        component="span" 
                        sx={{ 
                          display: 'inline-block',
                          width: '3px',
                          height: '1em',
                          backgroundColor: message.isUser ? 'rgba(255,255,255,0.8)' : '#ff6b35',
                          ml: 0.5,
                          animation: 'blink 1s infinite',
                          '@keyframes blink': {
                            '0%, 50%': { opacity: 1 },
                            '51%, 100%': { opacity: 0 }
                          }
                        }}
                      />
                    )}
                  </Typography>
                </MessageContent>
              </MessageBubble>
            ))}
            
            {isLoading && (
              <MessageBubble isUser={false}>
                <Avatar sx={{ 
                  width: 40, 
                  height: 40, 
                  background: "linear-gradient(135deg, rgba(252, 196, 132, 0.8) 0%, rgba(255, 138, 80, 0.6) 100%)",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px rgba(252, 196, 132, 0.3)",
                }}>
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
            <Typography variant="body2" sx={{ 
              color: "#ff6b35", 
              mr: 1, 
              fontWeight: 600,
              background: "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
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
                  borderColor: "rgba(252, 196, 132, 0.5)",
                  color: "#ff6b35",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
                    color: "white",
                    borderColor: "#ff6b35",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(255, 138, 80, 0.3)",
                  },
                  transition: "all 0.2s ease-in-out",
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
                <Paper sx={{ 
                  p: 1, 
                  mb: 1, 
                  display: "inline-block",
                  border: "1px solid rgba(252, 196, 132, 0.3)",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #fff8f0 0%, #fef5e7 100%)",
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <img
                      src={filePreview}
                      alt="Preview"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "2px solid rgba(252, 196, 132, 0.3)",
                      }}
                    />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {selectedFile?.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#ff6b35" }}>
                        {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={removeSelectedFile}
                      sx={{ 
                        ml: 1,
                        color: "#ff6b35",
                        "&:hover": {
                          backgroundColor: "rgba(255, 107, 53, 0.1)",
                        }
                      }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#fff8f0",
                    border: "1px solid rgba(252, 196, 132, 0.3)",
                    "&:hover": {
                      borderColor: "rgba(255, 138, 80, 0.5)",
                    },
                    "&.Mui-focused": {
                      borderColor: "#ff6b35",
                      boxShadow: "0 0 0 2px rgba(255, 138, 80, 0.2)",
                    },
                  },
                }}
              />
              
              <IconButton
                component="label"
                disabled={isLoading}
                sx={{ 
                  bgcolor: "rgba(252, 196, 132, 0.1)",
                  border: "2px solid rgba(252, 196, 132, 0.3)",
                  borderRadius: "12px",
                  color: "#ff6b35",
                  "&:hover": { 
                    bgcolor: "rgba(252, 196, 132, 0.2)",
                    borderColor: "#ff6b35",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(252, 196, 132, 0.3)",
                  },
                  transition: "all 0.2s ease-in-out",
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
                sx={{
                  background: "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
                  color: "white",
                  borderRadius: "12px",
                  minWidth: "48px",
                  minHeight: "48px",
                  "&:hover": { 
                    background: "linear-gradient(135deg, #ff6b35 0%, #ff5722 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 16px rgba(255, 138, 80, 0.4)",
                  },
                  "&:disabled": { 
                    background: "rgba(189, 189, 189, 0.5)",
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </InputContainer>
        </ChatContainer>
      </CardContent>
    </Card>
    </Box>
  );
};

export default AddNewStub;
