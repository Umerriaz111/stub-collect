import React, { useState } from "react";
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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
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
  height: "400px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(1),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  display: "flex",
  justifyContent: isUser ? "flex-end" : "flex-start",
  marginBottom: theme.spacing(1),
}));

const MessageContent = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(1, 2),
  maxWidth: "70%",
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[100],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: theme.spacing(2),
  wordBreak: "break-word",
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "flex-end",
}));

const SuggestionsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  display: "flex",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const AddNewStub = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("upload"); // "upload", "chat", "complete"
  const [stubCreated, setStubCreated] = useState(false);

  const navigate = useNavigate();

  const suggestions = [
    "All set, create my stub",
    "Tell me more about my stub",
    "What's the estimated value?",
    "Describe the event details",
    "What venue information do you see?",
    "When is this event?"
  ];

  const handleImageUpload = (e) => {
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
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setStep("upload");
    setChatMessages([]);
    setStubCreated(false);
  };

  const proceedToChat = () => {
    if (selectedFile) {
      setStep("chat");
      // Send initial message with image
      sendInitialMessage();
    }
  };

  const sendInitialMessage = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("query", "Please analyze this ticket stub and extract all relevant information");

    try {
      const response = await stubCreationAgent(formData);
      
      if (response.data.success) {
        setChatMessages([
          {
            id: 1,
            isUser: false,
            content: response.data.response,
            timestamp: new Date().toISOString(),
          }
        ]);

        // Check if stub was created
        if (response.data.stub_created && response.data.stub_id) {
          setStubCreated(true);
          setSuccess("Stub analyzed successfully! You can now create it or ask for more details.");
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to analyze stub");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      isUser: true,
      content: message,
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      // Only send image on the very first message, after that just send text queries
      // The backend agent maintains context from the initial image analysis
      formData.append("query", message);

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
          setStubCreated(true);
          setSuccess("Stub created successfully! Redirecting to preview...");
          
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
        content: `Error: ${error.response?.data?.message || "Failed to process request"}`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (step === "upload") {
    return (
      <Card
        sx={{
          maxWidth: 600,
          m: "auto",
          backgroundColor: "rgba(252, 196, 132, 1)",
          mt: 10,
        }}
      >
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Upload Your Stub
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            {previewImage ? (
              <>
                <Box
                  component="img"
                  src={previewImage}
                  alt="Preview"
                  sx={{
                    maxHeight: 200,
                    maxWidth: "100%",
                    mb: 2,
                    borderRadius: 1,
                  }}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={proceedToChat}
                    size="large"
                  >
                    Continue to Chat
                  </Button>
                  <IconButton onClick={removeImage} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    width: "100%",
                    height: 200,
                    bgcolor: "rgba(252, 196, 132, 1)",
                    border: "1px dashed black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    borderRadius: 1,
                  }}
                >
                  <Typography color="text.secondary">
                    Upload an image of your stub to get started
                  </Typography>
                </Box>

                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  size="large"
                >
                  Upload Stub Image
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageUpload}
                  />
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        maxWidth: 800,
        m: "auto",
        backgroundColor: "rgba(252, 196, 132, 1)",
        mt: 5,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Discuss Your Stub
          </Typography>
          <IconButton onClick={removeImage} color="error" title="Start over">
            <DeleteIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Preview Image */}
        {previewImage && (
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Box
              component="img"
              src={previewImage}
              alt="Stub Preview"
              sx={{
                maxHeight: 150,
                maxWidth: "100%",
                borderRadius: 1,
              }}
            />
          </Box>
        )}

        {/* Chat Interface */}
        <ChatContainer elevation={2}>
          <MessagesContainer>
            {chatMessages.map((message) => (
              <MessageBubble key={message.id} isUser={message.isUser}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {message.isUser ? <PersonIcon /> : <SmartToyIcon />}
                  </Avatar>
                  <MessageContent isUser={message.isUser}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </Typography>
                  </MessageContent>
                </Box>
              </MessageBubble>
            ))}
            {isLoading && (
              <MessageBubble isUser={false}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <SmartToyIcon />
                  </Avatar>
                  <MessageContent isUser={false}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Analyzing...
                    </Typography>
                  </MessageContent>
                </Box>
              </MessageBubble>
            )}
          </MessagesContainer>

          {/* Suggestions */}
          <SuggestionsContainer>
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                variant="outlined"
                sx={{ cursor: "pointer" }}
                disabled={isLoading}
              />
            ))}
          </SuggestionsContainer>

          {/* Input */}
          <InputContainer>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your stub..."
              disabled={isLoading}
              size="small"
            />
            <IconButton
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              color="primary"
            >
              <SendIcon />
            </IconButton>
          </InputContainer>
        </ChatContainer>
      </CardContent>
    </Card>
  );
};

export default AddNewStub;
