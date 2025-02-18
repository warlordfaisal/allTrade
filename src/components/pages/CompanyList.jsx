import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Modal,
  Box,
} from "@mui/material";
import CustomForm from "./CustomForm";

function CompanyList({ onCompanySelect }) {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
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

  const companyFields = [
    { label: "Company Name", name: "companyName", required: true },
    { label: "Contact Person", name: "contactPerson", required: true },
    { label: "GSTIN", name: "gst", required: true },
    { label: "Contact No.", name: "contact", required: true },
    { label: "Address", name: "companyAddress", required: true },
    { label: "City", name: "city", required: true },
    { label: "Pin Code", name: "pinCode", required: true },
    { label: "State", name: "state", required: true },
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/companies");
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleSelect = async (company) => {
    try {
      await axios.post("http://localhost:3000/api/switch-database", {
        companyId: company.id,
      });
      console.log(`Switched to Company Name ${company.name} & ID ${company.id} database`);
      onCompanySelect(company);
    } catch (error) {
      console.error(`Error switching to ${company.name} database:`, error);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/create-company",
        formData
      );

      if (response.status === 200 || response.status === 201) {
        setCompanies([
          ...companies,
          { id: response.data.id, name: response.data.name },
        ]);
        handleCloseModal();
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Container>
      {/* If there are companies, show button in the upper-right */}
      {companies.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 56,
            right: 56,
            zIndex: 1000, // Ensures it's above other content
          }}
        >
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            Create New Company
          </Button>
        </Box>
      )}

      <Typography variant="h4" gutterBottom>
        {companies.length === 0 ? "Welcome to Our App!" : "Select a Company"}
      </Typography>

      {/* If no companies exist, show button in the center */}
      {companies.length === 0 ? (
        <Box display="flex" justifyContent="center">
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            Create New Company
          </Button>
        </Box>
      ) : (
        <List>
          {companies.map((company, index) => (
            <ListItem
              component="button"
              key={company.id || `company-${index}`}
              onClick={() => handleSelect(company)}
            >
              <ListItemText primary={company.name} />
            </ListItem>
          ))}
        </List>
      )}

      {/* MODAL WITH CUSTOM FORM */}
      <Modal open={showModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ textAlign: "center", color: "#FFEFC8" }}
          >
            Company Creation
          </Typography>
          <CustomForm
            title="Create Company"
            fields={companyFields}
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            buttonText="Create"
            formStyle={{ backgroundColor: "#161a2d", color: "#FFEFC8" }}
          />
        </Box>
      </Modal>
    </Container>
  );
}

export default CompanyList;
