import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import axios from "axios"

const theme = createTheme();

function UploadDetails() {
  const [formData, setFormData] = React.useState({
    bannerId: {
      value: "",
      isError: false,
      errorMessage: "Maximum input size 9",
    },
    assignmentNo: {
      value: "",
      isError: false,
      errorMessage: "Maximum input size 1",
    },
    fileUpload: {
      value: null, // For file upload, we'll store the selected file in 'value'
      isError: false,
      errorMessage: "Upload valid image",
    },
  });
  const [imageBytecode, setImageBytecode] = useState("");

  function handleChange(event) {
    if (event.target.type === "file") {
      // Handle file upload separately
      setFormData((prevFormData) => ({
        ...prevFormData,
        fileUpload: {
          ...prevFormData.fileUpload,
          value: event.target.files[0], // Store the selected file
          isError: false,
        },
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [event.target.name]: {
          ...prevFormData[event.target.name],
          value: event.target.value,
          isError: false,
        },
      }));
    }
  }

  function validate() {
    let isValidationSuccess = true;

    // TODO: Add regex
    const regexBannerId = /^.{1,9}$/; // Maximum 9 characters for bannerId
    const regexAssignment = /^.{1}$/; // Maximum 1 character for assignmentNo

    if (!regexBannerId.test(formData.bannerId.value)) {
      isValidationSuccess = false;
      setFormData((prevFormData) => ({
        ...prevFormData,
        bannerId: {
          ...formData.bannerId,
          isError: true,
        },
      }));
      return isValidationSuccess;
    }

    if (!regexAssignment.test(formData.assignmentNo.value)) {
      isValidationSuccess = false;
      setFormData((prevFormData) => ({
        ...prevFormData,
        assignmentNo: {
          ...formData.assignmentNo,
          isError: true,
        },
      }));
      return isValidationSuccess;
    }


    // For file upload validation, check if a file is selected
    if (!formData.fileUpload.value) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        fileUpload: {
          ...prevFormData.fileUpload,
          isError: true,
        },
      }));
      return false;
    }

    return true;

  }

  function handleSubmit(event) {
    event.preventDefault();
    if (validate()) {
      // Encode the uploaded image into bytecode
      if (formData.fileUpload.value) {
        const reader = new FileReader();
        reader.readAsDataURL(formData.fileUpload.value);
        reader.onload = function () {
          const imageBytecode = reader.result;
          setImageBytecode(imageBytecode);
          // Here, 'imageBytecode' contains the encoded image data
          // Here, 'imageBytecode' contains the encoded image data
          const apiUrl = "https://eonbk8y322.execute-api.us-east-1.amazonaws.com/dev/extract";

          // Query string parameters
          const params = {
            bannerId: formData.bannerId.value,
            assignment: formData.assignmentNo.value,
          };
          const withoutPrefix = imageBytecode.replace(/^data:image\/(jpeg|png|gif);base64,/, "");
          // Make the POST request using Axios
          axios.post(apiUrl, withoutPrefix, {
            headers: {
              "Content-Type": "text/plain", // Set content type to "text/plain" for the encoded image data
            },
            params: params, // Attach query string parameters to the request
          })
            .then((response) => {
              // Handle the response data
              console.log("Response data:", response);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        };
      }
    }
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h5">
              Upload SDA Details
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="bannerId"
                    value={formData.bannerId.value}
                    onChange={handleChange}
                    required
                    fullWidth
                    id="bannerId"
                    label="Banner Id"
                    helperText={
                      formData.bannerId.isError && formData.bannerId.errorMessage
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="assignmentNo"
                    label="Assignment Number"
                    name="assignmentNo"
                    value={formData.assignmentNo.value}
                    onChange={handleChange}
                    helperText={
                      formData.assignmentNo.isError &&
                      formData.assignmentNo.errorMessage
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  {formData.fileUpload.isError && (
                    <span style={{ color: "red" }}>
                      {formData.fileUpload.errorMessage}
                    </span>
                  )}
                </Grid>
              </Grid>
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Upload
              </Button>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
      <div style={{ margin: "20px 0", whiteSpace: "pre-wrap" }}>
        {imageBytecode}
      </div>
    </>
  );
}

export default UploadDetails;
