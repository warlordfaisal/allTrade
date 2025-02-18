import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const Dashboard = () => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/get-company-info"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (data.status === "✅ Success" && data.data.length > 0) {
          setCompanyInfo(data.data[0]); // Store all details
        } else {
          setError("No company info found");
        }
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch company info:", e);
      }
    };

    fetchCompanyInfo();
  }, []);

  return (
    <>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
          }}
        >
          {companyInfo ? (
            <>
              <h1>Welcome {companyInfo.name}</h1>
              <p>📞 Contact: {companyInfo.contact}</p>
              <p>👤 Contact Person: {companyInfo.contact_person}</p>
            </>
          ) : (
            <>
              <CircularProgress disableShrink />
              <p>Loading...</p>
            </>
          )}
        </Box>
      )}
    </>
  );
};

export default Dashboard;
