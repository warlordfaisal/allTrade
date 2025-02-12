import React from "react";
import { Container, Typography, Button, Grid, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#3674B5", // Outline color
    },
    "&:hover fieldset": {
      borderColor: "#FFC145", // Outline color on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#074799", // Outline color when focused
    },
  },
  "& .MuiInputLabel-root": {
    color: "#578FCA", // Placeholder color
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#EAFAEA", // Placeholder color when focused
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "#F8E7F6", // Placeholder color
  },
  '& input': {
    color: '#FFEFC8', // Input text color
  },
}));

const CustomForm = ({
  title,
  fields,
  handleSubmit,
  formData,
  handleChange,
  buttonText,
  formStyle,
}) => {
  return (
    <Container
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: 600,
        backgroundColor: formStyle.backgroundColor,
        margin: "auto",
        padding: 2,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: formStyle.color }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {fields.map((field, index) => (
          <Grid item xs={12} sm={field.sm || 6} key={index}>
            <CustomTextField
              label={field.label}
              type={field.type || "text"}
              placeholder={field.placeholder}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              fullWidth
              required={field.required || false}
              InputLabelProps={field.type === "date" ? { shrink: true } : {}}
            />
          </Grid>
        ))}
      </Grid>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ height: 45 }}
      >
        {buttonText}
      </Button>
    </Container>
  );
};

export default CustomForm;
