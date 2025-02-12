import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Typography, Container } from "@mui/material";
import "./CompanyList.css";

function CompanyList({ onCompanySelect }) {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/companies");
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  const handleSelect = async (company) => {
    try {
      // Call the API to switch to the selected company's database
      await axios.post("http://localhost:3000/api/switch-database", {
        companyId: company.id,
      });
      console.log(`Switched to ${company.name} database`);

      // Update the state in App.jsx (which remembers it for the session)
      onCompanySelect(company);
    } catch (error) {
      console.error(`Error switching to ${company.name} database:`, error);
    }
  };

  if (companies.length === 0) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Welcome to Our App!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onCompanySelect(null)}
        >
          Create New Company
        </Button>
      </Container>
    );
  }

  return (
    <div className="company-list-container">
      <h1>Select a Company</h1>
      <ul className="company-list">
        {companies.map((company) => (
          <li
            key={company.id}
            onClick={() => handleSelect(company)}
            className="company-list-item"
          >
            {company.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CompanyList;
