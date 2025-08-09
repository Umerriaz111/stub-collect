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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { uploadStub } from "../../../core/api/stub";
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

const AddNewStub = () => {
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !selectedFile) {
      setError("Please provide both title and image");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("title", title);

    try {
      const response = await uploadStub(formData);
      setSuccess("Stub uploaded successfully!");
      // Navigate to preview page
      navigate(`/stub-preview/${response.data.data.id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload stub");
    }
  };

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
          Add New Stub
        </Typography>

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

        <Box component="form" onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            {previewImage ? (
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
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  // bgcolor: "grey.100",
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
                  Image Preview Will Appear Here
                </Typography>
              </Box>
            )}

            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
            >
              Upload Image
              <VisuallyHiddenInput
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageUpload}
              />
            </Button>
          </Box>

          {/* Title Field */}
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 3 }}
            required
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={!title || !selectedFile}
          >
            Create Stub
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddNewStub;
