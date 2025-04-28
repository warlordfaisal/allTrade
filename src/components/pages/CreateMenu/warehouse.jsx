import React, { useState, useEffect, useRef } from "react";
import CustomForm from "../CustomForm";
import CustomTable from "../CustomTable";
import {
  Typography,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Paper,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Warehouse = () => {
  const [formData, setFormData] = useState({
    warehouseName: "",
    address: "",
    contactPerson: "",
    contactNum: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editWarehouseId, setEditWarehouseId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const dialogRef = useRef(null); // Ref for dialog focus

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/warehouses");
      const result = await response.json();
      if (response.ok) {
        setWarehouses(result.data);
      } else {
        console.error("Error fetching warehouses:", result.message);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isDuplicate = warehouses.some(
      (warehouse) =>
        warehouse.warehouseName.toLowerCase() ===
          formData.warehouseName.toLowerCase() &&
        warehouse.id !== editWarehouseId
    );

    if (isDuplicate) {
      showSnackbar(
        `Warehouse with name "${formData.warehouseName}" already exists.`,
        "warning"
      );
      return;
    }

    const url = editWarehouseId
      ? `http://localhost:3000/api/warehouse/${editWarehouseId}`
      : "http://localhost:3000/api/warehouse";
    const method = editWarehouseId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        showSnackbar(
          editWarehouseId
            ? `Warehouse "${formData.warehouseName}" updated successfully!`
            : `Warehouse "${formData.warehouseName}" added successfully!`
        );
        setSubmitMessage(
          editWarehouseId
            ? `✅ Warehouse "${formData.warehouseName}" updated successfully!`
            : `✅ Warehouse "${formData.warehouseName}" added successfully!`
        );
        setFormData({
          warehouseName: "",
          address: "",
          contactPerson: "",
          contactNum: "",
        });
        setEditWarehouseId(null);
        fetchWarehouses();
        setShowForm(false);
      } else {
        setSubmitMessage(`❌ Error: ${result.message}`);
        showSnackbar(`Error: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitMessage("❌ Network error, please try again.");
      showSnackbar("Network error, please try again.", "error");
    }
  };

  const handleDelete = async () => {
    if (!warehouseToDelete) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/warehouse/${warehouseToDelete.id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setSubmitMessage(
          `✅ Warehouse "${warehouseToDelete.warehouseName}" deleted successfully!`
        );
        showSnackbar(
          `Warehouse "${warehouseToDelete.warehouseName}" deleted successfully!`
        );
        fetchWarehouses();
      } else {
        const result = await response.json();
        setSubmitMessage(`❌ Error deleting warehouse: ${result.message}`);
        showSnackbar(`Error deleting warehouse: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      setSubmitMessage("❌ Network error, please try again.");
      showSnackbar("Network error, please try again.", "error");
    } finally {
      setDeleteDialogOpen(false);
      setWarehouseToDelete(null);
    }
  };

  const handleEditClick = (warehouse) => {
    console.log("Editing warehouse:", warehouse);
    setFormData({
      warehouseName: warehouse.warehouseName,
      address: warehouse.address,
      contactPerson: warehouse.contactPerson,
      contactNum: warehouse.contactNum,
    });
    setEditWarehouseId(warehouse.id);
    setSubmitMessage("");
    setShowForm(true);
    console.log("Form data set:", {
      formData: {
        warehouseName: warehouse.warehouseName,
        address: warehouse.address,
        contactPerson: warehouse.contactPerson,
        contactNum: warehouse.contactNum,
      },
      editWarehouseId: warehouse.id,
      showForm: true,
    });
  };

  const handleDeleteClick = (warehouse) => {
    console.log("Opening delete dialog for warehouse:", warehouse);
    setWarehouseToDelete(warehouse);
    setDeleteDialogOpen(true);
    // Move focus to dialog after it opens
    setTimeout(() => {
      if (dialogRef.current) {
        dialogRef.current.focus();
        console.log("Focus moved to delete dialog");
      }
    }, 100);
  };

  const columns = [
    { field: "index", headerName: "#", renderCell: (_, index) => index + 1 },
    { field: "warehouseName", headerName: "Warehouse Name" },
    { field: "address", headerName: "Address" },
    { field: "contactPerson", headerName: "Contact Person" },
    { field: "contactNum", headerName: "Contact Number" },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (row) => (
        <>
          <IconButton
            color="info"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => handleEditClick(row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(row)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography sx={{ color: "#F1E7E7" }} variant="h4" gutterBottom>
          Warehouse List
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setShowForm(true);
            setEditWarehouseId(null);
            setFormData({
              warehouseName: "",
              address: "",
              contactPerson: "",
              contactNum: "",
            });
            setSubmitMessage("");
          }}
        >
          + Add Warehouse
        </Button>
      </Box>

      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "#1C2137",
              padding: "20px",
              borderRadius: "8px",
              position: "relative",
              width: "90%",
              maxWidth: 600,
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              sx={{ position: "absolute", top: 10, right: 10 }}
              onClick={() => {
                setShowForm(false);
                setEditWarehouseId(null);
                setSubmitMessage("");
              }}
            >
              Close
            </Button>

            <CustomForm
              title={
                editWarehouseId
                  ? "Edit Warehouse Information"
                  : "Warehouse Information"
              }
              fields={[
                {
                  label: "Warehouse Name",
                  name: "warehouseName",
                  type: "text",
                  placeholder: "Enter Warehouse Name",
                  required: true,
                  sm: 6,
                },
                {
                  label: "Address",
                  name: "address",
                  type: "text",
                  placeholder: "Enter Address",
                  required: true,
                  sm: 12,
                  multiline: true,
                  rows: 3,
                },
                {
                  label: "Contact Person",
                  name: "contactPerson",
                  type: "text",
                  placeholder: "Enter Contact Person",
                  required: true,
                  sm: 6,
                },
                {
                  label: "Contact Number",
                  name: "contactNum",
                  type: "tel",
                  placeholder: "Enter Contact Number",
                  required: true,
                  sm: 6,
                },
              ]}
              handleSubmit={handleSubmit}
              formData={formData}
              handleChange={handleChange}
              buttonText={
                editWarehouseId
                  ? "Update Warehouse Info"
                  : "Submit Warehouse Info"
              }
            />
            {submitMessage && (
              <Typography
                variant="body1"
                sx={{ color: "#d1a617", textAlign: "center", mt: 2 }}
              >
                {submitMessage}
              </Typography>
            )}
          </div>
        </div>
      )}

      <Paper
        sx={{
          width: "105%",
          margin: "0 auto",
          overflow: "auto",
          maxHeight: "75vh",
        }}
      >
        <CustomTable
          columns={columns}
          rows={warehouses}
          noDataMessage="No warehouses found"
        />
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        ref={dialogRef}
        tabIndex={-1}
      >
        <DialogTitle id="delete-dialog-title">Delete Warehouse</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete warehouse{" "}
            <strong>{warehouseToDelete?.warehouseName}</strong>? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Warehouse;
