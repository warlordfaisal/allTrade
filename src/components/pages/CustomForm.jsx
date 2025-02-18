import React from "react";
import { Container, Typography, Button, Grid, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled MUI TextField for consistent theming
const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#3674B5" },
    "&:hover fieldset": { borderColor: "#FFC145" },
    "&.Mui-focused fieldset": { borderColor: "#074799" },
  },
  "& .MuiInputLabel-root": { color: "#578FCA" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#EAFAEA" },
  "& .MuiOutlinedInput-input::placeholder": { color: "#F8E7F6" },
  "& input": { color: "#FFEFC8" },
}));

const CustomForm = ({
  title = "Form",
  fields = [],
  handleSubmit = () => {},
  formData = {},
  handleChange = () => {},
  buttonText = "Submit",
  formStyle = {},
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
        backgroundColor: formStyle.backgroundColor || "#ffffff",
        margin: "auto",
        padding: 3,
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Form Title */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: formStyle.color || "#333", textAlign: "center" }}
      >
        {title}
      </Typography>

      {/* Form Fields */}
      <Grid container spacing={2}>
        {fields.length > 0 ? (
          fields.map((field, index) => (
            <Grid item xs={12} sm={field.sm || 6} key={index}>
              <CustomTextField
                label={field.label || "Field"}
                type={field.type || "text"}
                placeholder={field.placeholder || ""}
                name={field.name || `field_${index}`}
                value={formData[field.name] || ""}
                onChange={handleChange}
                fullWidth
                required={field.required || false}
                InputLabelProps={field.type === "date" ? { shrink: true } : {}}
              />
            </Grid>
          ))
        ) : (
          <Typography sx={{ color: "red", textAlign: "center", width: "100%" }}>
            ⚠️ No fields available
          </Typography>
        )}
      </Grid>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ height: 45, marginTop: 2 }}
      >
        {buttonText}
      </Button>
    </Container>
  );
};

export default CustomForm;
