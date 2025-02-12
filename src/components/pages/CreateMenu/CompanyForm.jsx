import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomForm from "../CustomForm";

const CompanyForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    gst: "",
    companyAddress: "",
    contact: "",
    contactPerson: "",
    city: "",
    pinCode: "",
    state: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/api/create-company",
        formData
      );
      console.log("Company created:", response.data);
      navigate("/companies");
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  const formFields = [
    { label: "Company Name", name: "companyName", required: true },
    { label: "Contact Person", name: "contactPerson", required: true },
    { label: "GSTIN", name: "gst", required: true },
    { label: "Contact No.", name: "contact", required: true },
    { label: "Address", name: "companyAddress", required: true },
    { label: "City", name: "city", required: true },
    { label: "Pin Code", name: "pinCode", required: true },
    { label: "State", name: "state", required: true },
  ];

  return (
    <CustomForm
      title="Create New Company"
      fields={formFields}
      handleSubmit={handleSubmit}
      formData={formData}
      handleChange={handleChange}
      buttonText="Create Company"
      formStyle={{ backgroundColor: "#161a2d", color: "#FFEFC8" }}
    />
  );
};

export default CompanyForm;
