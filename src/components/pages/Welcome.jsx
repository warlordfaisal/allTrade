import React from "react";
import { Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  const handleCreateCompany = () => {
    // Logic to create a new company database
    // After creating the company, navigate to the company list
    // For example, you can call an IPC event to create the database
    // ipcRenderer.send('create-company-database');

    // Simulate database creation and navigate to company list
    navigate("/comp-create");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome to Our App!
      </Typography>
      <Button variant="contained" color="primary" onClick={handleCreateCompany}>
        Create New Company
      </Button>
    </Container>
  );
};

export default Welcome;
