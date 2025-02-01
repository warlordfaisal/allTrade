import React from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const AllReports = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        width: 300,
        backgroundColor: "#161a2d",
        padding: 2,
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography variant="h6" gutterBottom>
        All Reports
      </Typography>
      <Link
        to="/Stock"
        style={{
          color: "primary",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        Stock Details
      </Link>
      <Link
        to="/DObook"
        style={{
          color: "primary",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        D. O. Book
      </Link>
      <Link
        to="/PurchaseReg"
        style={{
          color: "primary",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        Purchase Register
      </Link>
      <Link
        to="/Outstanding"
        style={{
          color: "primary",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        outStanding
      </Link>
      <Link
        to="/ForwardPur"
        style={{
          color: "primary",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        Forward Purchase
      </Link>
      <Link
        to="/Forwardsale"
        style={{
          color: "#EAE2C6",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        Forward Sales
      </Link>
    </Box>
  );
};

export default AllReports;
