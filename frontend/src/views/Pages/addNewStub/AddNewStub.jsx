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
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  // Markdown-specific styles
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
    backgroundColor: isUser
      ? "rgba(255,255,255,0.25)"
      : "rgba(252, 196, 132, 0.2)",
    padding: "2px 6px",
    borderRadius: "6px",
    fontSize: "0.9em",
    fontFamily: "monospace",
  },
  "& pre": {
    backgroundColor: isUser
      ? "rgba(255,255,255,0.15)"
      : "rgba(252, 196, 132, 0.1)",
    padding: "12px",
    borderRadius: "8px",
    overflow: "auto",
    margin: "8px 0",
    "& code": {
      backgroundColor: "transparent",
      padding: 0,
    },
  },
  "& blockquote": {
    borderLeft: `4px solid ${
      isUser ? "rgba(255,255,255,0.4)" : "rgba(252, 196, 132, 0.6)"
    }`,
    paddingLeft: "12px",
    margin: "8px 0",
    fontStyle: "italic",
  },
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    margin: "12px 0 8px 0",
    fontWeight: 600,
  },
  "& a": {
    color: isUser ? "#ffffff" : "#ff6b35",
    textDecoration: "underline",
    "&:hover": {
      textDecoration: "none",
    },
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
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
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
    "Help me understand the ticket details",
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
        content:
          "👋 **Welcome to StubCollect!**\n\nI'm here to help you create and analyze your ticket stubs. You can:\n\n• **Upload an image** of your ticket stub\n• **Ask questions** about your stub\n• **Get detailed analysis** of event information\n• **Create listings** for your stubs\n\nTo get started, simply upload an image of your stub or ask me anything!",
        timestamp: new Date().toISOString(),
        isWelcome: true,
      },
    ]);
  }, []);

  // Typing animation function
  const typeMessage = (messageId, fullContent, onComplete) => {
    let currentIndex = 0;
    setTypingMessageId(messageId);

    const typeNextChar = () => {
      if (currentIndex <= fullContent.length) {
        setChatMessages((prev) =>
          prev.map((msg) =>
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
      // Check if user has already uploaded an image in the chat
      if (hasUploadedImage) {
        setError(
          "You can only upload one image at a time. Please restart the chat or remove the previous image to upload a new one."
        );
        return;
      }

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

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Clear file selection after sending and mark that an image has been uploaded
    if (file) {
      removeSelectedFile();
      setHasUploadedImage(true);
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
        setChatMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);

        // Start typing animation
        typeMessage(botMessageId, response.data.response, () => {
          // Check if stub was created and navigate after typing is complete
          if (response.data.stub_created && response.data.stub_id) {
            setSuccess(
              "🎉 Stub created successfully! Redirecting to preview..."
            );

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

      setChatMessages((prev) => [...prev, errorMessage]);

      // Type the error message
      typeMessage(
        errorMessageId,
        `❌ **Error:** ${
          error.response?.data?.message || "Failed to process request"
        }`
      );
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === "Upload a stub image to get started") {
      if (hasUploadedImage) {
        setError(
          "Image already uploaded. Please restart the chat to upload a new image."
        );
        return;
      }
      fileInputRef.current?.click();
    } else {
      sendMessage(suggestion);
    }
  };

  const restartChat = () => {
    setChatMessages([
      {
        id: 1,
        isUser: false,
        content:
          "👋 **Welcome to StubCollect!**\n\nI'm here to help you create and analyze your ticket stubs. You can:\n\n• **Upload an image** of your ticket stub\n• **Ask questions** about your stub\n• **Get detailed analysis** of event information\n• **Create listings** for your stubs\n\nTo get started, simply upload an image of your stub or ask me anything!",
        timestamp: new Date().toISOString(),
        isWelcome: true,
      },
    ]);
    setHasUploadedImage(false);
    setSelectedFile(null);
    setFilePreview(null);
    setInputMessage("");
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <BackToMainButton
        to={"/dashboard"}
        backgroundColor="rgba(252, 196, 132, 0.9)"
        hoverColor="#ff6b35"
        position={{ top: 10, left: 0 }}
      />

      <Card
        sx={{
          maxWidth: "90vw",
          m: "auto",
          pt: 8,
          borderRadius: "20px",
          boxShadow: "0",
          backgroundColor: "transparent",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: 1,
              borderColor: "rgba(252, 228, 200, 0.62)",
              background:
                "linear-gradient(135deg, rgba(252, 196, 132, 0.67) 0%, rgba(252, 152, 102, 0.71) 100%)",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  background:
                    "linear-gradient(135deg, #fa844aff 0%, #ff6b35 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                💬 Stub Creator Chat
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload your ticket stub and chat with our AI to create your
                listing
              </Typography>
              {hasUploadedImage && (
                <Chip
                  label="✓ Image Uploaded"
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: "rgba(255, 107, 53, 0.1)",
                    color: "#ff6b35",
                    border: "1px solid rgba(255, 107, 53, 0.3)",
                  }}
                />
              )}
            </Box>
            {hasUploadedImage && (
              <Button
                variant="outlined"
                onClick={restartChat}
                sx={{
                  borderColor: "#ff6b35",
                  color: "#ff6b35",
                  "&:hover": {
                    borderColor: "#ff5722",
                    backgroundColor: "rgba(255, 107, 53, 0.1)",
                  },
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                🔄 Restart Chat
              </Button>
            )}
          </Box>

          {/* Alerts */}
          {error && <Alert severity="error">{error}</Alert>}

          {success && <Alert severity="success">{success}</Alert>}

          {/* Chat Interface */}
          <ChatContainer
            sx={{ borderRadius: "0px 0px 20px 20px" }}
            elevation={0}
          >
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
                      <Box
                        sx={{
                          mb: 2,
                          p: 1,
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "12px",
                          backgroundColor: message.isUser
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(252, 196, 132, 0.1)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: message.isUser
                              ? "rgba(255, 255, 255, 0.9)"
                              : "#ff6b35",
                            fontWeight: 600,
                            textAlign: "center",
                          }}
                        >
                          📷 Uploaded Image
                        </Typography>
                        <img
                          src={message.imagePreview}
                          alt="Uploaded stub"
                          style={{
                            maxWidth: "250px",
                            maxHeight: "200px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      </Box>
                    )}
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom component to ensure Typography variant consistency
                        p: ({ children }) => (
                          <Typography variant="body1" component="p">
                            {children}
                          </Typography>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {typingMessageId === message.id && (
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          width: "3px",
                          height: "1em",
                          backgroundColor: message.isUser
                            ? "rgba(255,255,255,0.8)"
                            : "#ff6b35",
                          ml: 0.5,
                          animation: "blink 1s infinite",
                          "@keyframes blink": {
                            "0%, 50%": { opacity: 1 },
                            "51%, 100%": { opacity: 0 },
                          },
                        }}
                      />
                    )}
                  </MessageContent>
                </MessageBubble>
              ))}

              {isLoading && (
                <MessageBubble isUser={false}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background:
                        "linear-gradient(135deg, rgba(252, 196, 132, 0.8) 0%, rgba(255, 138, 80, 0.6) 100%)",
                      color: "#ffffff",
                      boxShadow: "0 2px 8px rgba(252, 196, 132, 0.3)",
                    }}
                  >
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
              <Typography
                variant="body2"
                sx={{
                  color: "#ff6b35",
                  mr: 1,
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                💡 Quick actions:
              </Typography>
              {suggestions
                .filter((suggestion) => {
                  // Hide upload suggestion if image already uploaded
                  if (
                    hasUploadedImage &&
                    suggestion === "Upload a stub image to get started"
                  ) {
                    return false;
                  }
                  return true;
                })
                .map((suggestion, index) => (
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
                        background:
                          "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
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
                  <Paper
                    sx={{
                      p: 1,
                      mb: 1,
                      display: "inline-block",
                      border: "1px solid rgba(252, 196, 132, 0.3)",
                      borderRadius: "12px",
                      background:
                        "linear-gradient(135deg, #fff8f0 0%, #fef5e7 100%)",
                    }}
                  >
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
                          },
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

                <Tooltip
                  title={
                    hasUploadedImage
                      ? "Image already uploaded. Restart chat to upload a new image."
                      : "Upload image"
                  }
                  arrow
                  placement="top"
                >
                  <span>
                    <IconButton
                      component="label"
                      disabled={isLoading || hasUploadedImage}
                      sx={{
                        bgcolor: hasUploadedImage
                          ? "rgba(189, 189, 189, 0.2)"
                          : "rgba(252, 196, 132, 0.1)",
                        border: hasUploadedImage
                          ? "2px solid rgba(189, 189, 189, 0.3)"
                          : "2px solid rgba(252, 196, 132, 0.3)",
                        borderRadius: "12px",
                        color: hasUploadedImage
                          ? "rgba(189, 189, 189, 0.7)"
                          : "#ff6b35",
                        "&:hover": hasUploadedImage
                          ? {}
                          : {
                              bgcolor: "rgba(252, 196, 132, 0.2)",
                              borderColor: "#ff6b35",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(252, 196, 132, 0.3)",
                            },
                        transition: "all 0.2s ease-in-out",
                        position: "relative",
                      }}
                    >
                      <ImageIcon />
                      {hasUploadedImage && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            bgcolor: "#ff6b35",
                            color: "white",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          ✓
                        </Box>
                      )}
                      <VisuallyHiddenInput
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileSelect}
                      />
                    </IconButton>
                  </span>
                </Tooltip>

                <IconButton
                  onClick={() => sendMessage()}
                  disabled={
                    isLoading || (!inputMessage.trim() && !selectedFile)
                  }
                  sx={{
                    background:
                      "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
                    color: "white",
                    borderRadius: "12px",
                    minWidth: "48px",
                    minHeight: "48px",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #ff6b35 0%, #ff5722 100%)",
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
