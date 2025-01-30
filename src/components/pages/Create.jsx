import React from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const LinksBox = () => {
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
        Create Menu
      </Typography>
      <Link
        to="/Broker"
        style={{
          color: "primary",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        Broker
      </Link>
      <Link
        to="/creditors"
        style={{
          color: "primary",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        Creditors
      </Link>
      <Link
        to="/debtors"
        style={{
          color: "primary",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        Debtors
      </Link>
      <Link
        to="/inventory"
        style={{
          color: "primary",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        Inventory
      </Link>
      <Link
        to="/warehouse"
        style={{
          color: "primary",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        Warehouse
      </Link>
    </Box>
  );
};

export default LinksBox;
