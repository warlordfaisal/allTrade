import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TextField, Grid, Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Reusable Input Field Component
const CustomTextField = ({ label, placeholder, value, onChange, type, ...props }) => {
  const theme = useTheme();
  return (
    <TextField
      label={label}
      placeholder={placeholder}
      variant="outlined"
      value={value}
      onChange={onChange}
      type={type}
      sx={{
        "& .MuiOutlinedInput-root": {
          color: "#fff", // Change input text color
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#F14A00", // Change border color on hover
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#FFD65A", // Change border color when focused
          },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main, // Default border color
        },
        "& .MuiInputBase-input::placeholder": {
          color: "#fff", // Change placeholder text color
        },
        "& .MuiFormLabel-root": {
          color: "#fff", // Change label color
        },
      }}
      {...props}
    />
  );
};

// Define prop types for CustomTextField
CustomTextField.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
};

const ForwardPurchase = () => {
  const [formData, setFormData] = useState({
    date: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    // Set the default date to the current date in YYYY-MM-DD format (required for input type="date")
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,
    }));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted", formData);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: 600,
        backgroundColor: "#161a2d",
        margin: "auto",
        padding: 2,
      }}
    >
      <Typography variant="h4" color="white" gutterBottom>
        Forward Purchase
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="First Name"
            placeholder="Enter your first name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Last Name"
            placeholder="Enter your last name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Email Address"
            placeholder="Enter your email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Phone Number"
            placeholder="Enter your phone number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Address"
            placeholder="Enter your address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="City"
            placeholder="Enter your city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="State"
            placeholder="Enter your state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label="Zip Code"
            placeholder="Enter your zip code"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
      </Grid>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ height: 45 }}
      >
        Submit
      </Button>
    </Box>
  );
};

export default ForwardPurchase;