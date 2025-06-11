import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { uploadStub } from "../../../core/api/stub";

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
  const [description, setDescription] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ description, image: previewImage });

    const uploadData = {
      image: previewImage, // Your File object from input
      title: description,
    };

    try {
      const response = await uploadStub(uploadData);
      console.log("Upload successful:", response.data);
      // Handle success (e.g., show success message, redirect, etc.)
    } catch (error) {
      console.error("Upload failed:", error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h1" gutterBottom>
          Add New Stub
        </Typography>

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
                  bgcolor: "grey.100",
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
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </Box>

          {/* Description Field */}
          <TextField
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={!description || !previewImage}
          >
            Create Stub
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddNewStub;
