import React, { useState } from "react";
import CustomForm from "./CustomForm";

const ForwardPurchaseForm = () => {
  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0]; // YYYY-MM-DD format

  const [formData, setFormData] = useState({
    date: formattedToday,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Logic to handle form submission will go here
  };

  const formFields = [
    { label: "Date", name: "date", type: "date", required: true },
    {
      label: "First Name",
      name: "firstName",
      placeholder: "Enter your first name",
      required: true,
    },
    {
      label: "Last Name",
      name: "lastName",
      placeholder: "Enter your last name",
      required: true,
    },
    {
      label: "Email Address",
      name: "email",
      placeholder: "Enter your email",
      required: true,
    },
    {
      label: "Phone Number",
      name: "phone",
      placeholder: "Enter your phone number",
      required: true,
    },
    {
      label: "Address",
      name: "address",
      placeholder: "Enter your address",
      required: true,
    },
    {
      label: "City",
      name: "city",
      placeholder: "Enter your city",
      required: true,
    },
    {
      label: "State",
      name: "state",
      placeholder: "Enter your state",
      required: true,
    },
    {
      label: "Zip Code",
      name: "zip",
      placeholder: "Enter your zip code",
      required: true,
    },
  ];

  return (
    <CustomForm
      title="Forward Purchase"
      fields={formFields}
      handleSubmit={handleSubmit}
      formData={formData}
      handleChange={handleChange}
      buttonText="Submit"
      formStyle={{ backgroundColor: "#161a2d", color: "#FFEFC8" }}
    />
  );
};

export default ForwardPurchaseForm;
