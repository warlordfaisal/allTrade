import React from "react";
import { Container, Typography, Button, Grid, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";

/**
 * @typedef {Object} CustomFormProps
 * @property {string} title
 * @property {Array<Object>} fields
 * @property {Function} handleSubmit
 * @property {Object} formData
 * @property {Function} handleChange
 * @property {string} buttonText
 */

// Color variables defined at the top
const COLORS = {
  formBackground: "#161a2d", // Form container background
  inputBackground: "#171d38", // Input field background
  title: "#ebeeff", // Title color (changed from #333 to match your focused label)
  borderDefault: "#3674B5", // Default input border
  borderHover: "#FFC145", // Hover input border
  borderFocused: "#ffefca", // Focused input border
  labelDefault: "#578FCA", // Default label color
  labelFocused: "#d1a617", // Focused label color
  placeholder: "#F8E7F6", // Placeholder text color
  inputText: "#FFEFC8", // Input text color
  buttonDefault: "#3674B5", // Button default color
  buttonHover: "#074799", // Button hover color
  errorText: "red", // Error message color
};

// Centralized styled TextField with consistent design
const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: COLORS.borderDefault },
    "&:hover fieldset": { borderColor: COLORS.borderHover },
    "&.Mui-focused fieldset": { borderColor: COLORS.borderFocused },
  },
  "& .MuiInputLabel-root": { color: COLORS.labelDefault },
  "& .MuiInputLabel-root.Mui-focused": { color: COLORS.labelFocused },
  "& .MuiOutlinedInput-input::placeholder": { color: COLORS.placeholder },
  "& input": { color: COLORS.inputText },
  backgroundColor: COLORS.inputBackground,
  // Remove arrows from number inputs
  "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button":
    {
      "-webkit-appearance": "none",
      margin: 0,
    },
  "& input[type=number]": {
    MozAppearance: "textfield", // Firefox support
  },
}));

// Centralized form container styles
const FormContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  width: 600,
  backgroundColor: COLORS.formBackground,
  margin: "auto",
  padding: 20,
  borderRadius: "8px",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
}));

// Centralized button styles
const SubmitButton = styled(Button)(({ theme }) => ({
  height: 45,
  marginTop: 2,
  backgroundColor: COLORS.buttonDefault,
  "&:hover": { backgroundColor: COLORS.buttonHover },
}));

const CustomForm = ({
  title = "Form",
  fields = [],
  handleSubmit = () => {},
  formData = {},
  handleChange = () => {},
  buttonText = "Submit",
}) => {
  const handleFormSubmit = (event) => {
    try {
      event.preventDefault();
      handleSubmit(event);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <FormContainer component="form" onSubmit={handleFormSubmit}>
      {/* Form Title */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: COLORS.title, textAlign: "center" }} // Uses title color from COLORS
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
          <Typography
            sx={{ color: COLORS.errorText, textAlign: "center", width: "100%" }}
          >
            ⚠️ No fields available
          </Typography>
        )}
      </Grid>

      {/* Submit Button */}
      <SubmitButton type="submit" variant="contained">
        {buttonText}
      </SubmitButton>
    </FormContainer>
  );
};

CustomForm.propTypes = {
  title: PropTypes.string,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      sm: PropTypes.number,
    })
  ),
  handleSubmit: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
};

export default CustomForm;
