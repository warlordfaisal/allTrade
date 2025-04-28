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
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Broker = () => {
  const [formData, setFormData] = useState({
    brokerName: "",
    phone: "",
    bank: "",
    bankAccount: "",
    ifsc: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");
  const [brokers, setBrokers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editBrokerId, setEditBrokerId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const dialogRef = useRef(null);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchBrokers = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/brokers");
      const result = await response.json();
      if (response.ok) {
        setBrokers(result.data);
      } else {
        console.error("Error fetching brokers:", result.message);
      }
    } catch (error) {
      console.error("Error fetching brokers:", error);
    }
  };

  useEffect(() => {
    fetchBrokers();
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

    // Check for duplicate broker name (client-side)
    const isDuplicate = brokers.some(
      (broker) =>
        broker.brokerName.toLowerCase() === formData.brokerName.toLowerCase() &&
        broker.id !== editBrokerId
    );

    if (isDuplicate) {
      console.log(`Duplicate brokerName detected: ${formData.brokerName}`);
      showSnackbar(
        `Broker with name "${formData.brokerName}" already exists.`,
        "warning"
      );
      return;
    }

    const url = editBrokerId
      ? `http://localhost:3000/api/broker/${editBrokerId}`
      : "http://localhost:3000/api/broker";
    const method = editBrokerId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok) {
        showSnackbar(
          editBrokerId
            ? `Broker "${formData.brokerName}" updated successfully!`
            : `Broker "${formData.brokerName}" added successfully!`
        );
        setSubmitMessage(
          editBrokerId
            ? `✅ Broker "${formData.brokerName}" updated successfully!`
            : `✅ Broker "${formData.brokerName}" added successfully!`
        );
        setFormData({
          brokerName: "",
          phone: "",
          bank: "",
          bankAccount: "",
          ifsc: "",
        });
        setEditBrokerId(null);
        fetchBrokers();
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
    if (!brokerToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/broker/${brokerToDelete.id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setSubmitMessage(
          `✅ Broker "${brokerToDelete.brokerName}" deleted successfully!`
        );
        showSnackbar(
          `Broker "${brokerToDelete.brokerName}" deleted successfully!`
        );
        fetchBrokers();
      } else {
        const result = await response.json();
        setSubmitMessage(`❌ Error deleting broker: ${result.message}`);
        showSnackbar(`Error deleting broker: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error deleting broker:", error);
      setSubmitMessage("❌ Network error, please try again.");
      showSnackbar("Network error, please try again.", "error");
    } finally {
      setDeleteDialogOpen(false);
      setBrokerToDelete(null);
    }
  };

  const handleEditClick = (broker) => {
    console.log("Editing broker:", broker);
    setFormData({
      brokerName: broker.brokerName,
      phone: broker.phone,
      bank: broker.bank || "",
      bankAccount: broker.bankAccount || "",
      ifsc: broker.ifsc || "",
    });
    setEditBrokerId(broker.id);
    setSubmitMessage("");
    setShowForm(true);
    console.log("Form data set:", {
      formData: {
        brokerName: broker.brokerName,
        phone: broker.phone,
        bank: broker.bank,
        bankAccount: broker.bankAccount,
        ifsc: broker.ifsc,
      },
      editBrokerId: broker.id,
      showForm: true,
    });
  };

  const handleDeleteClick = (broker) => {
    console.log("Opening delete dialog for broker:", broker);
    setBrokerToDelete(broker);
    setDeleteDialogOpen(true);
    setTimeout(() => {
      if (dialogRef.current) {
        dialogRef.current.focus();
        console.log("Focus moved to delete dialog");
      }
    }, 100);
  };

  const columns = [
    { field: "index", headerName: "#", renderCell: (_, index) => index + 1 },
    { field: "brokerName", headerName: "Broker Name" },
    { field: "phone", headerName: "Phone" },
    { field: "bank", headerName: "Bank" },
    { field: "bankAccount", headerName: "Account No." },
    { field: "ifsc", headerName: "IFSC" },
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
    <div style={{ position: "relative", padding: "20px" }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ position: "absolute", top: 0, right: 0 }}
        onClick={() => {
          setShowForm(true);
          setEditBrokerId(null);
          setFormData({
            brokerName: "",
            phone: "",
            bank: "",
            bankAccount: "",
            ifsc: "",
          });
          setSubmitMessage("");
        }}
      >
        + Add Broker
      </Button>

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
                setEditBrokerId(null);
                setSubmitMessage("");
              }}
            >
              Close
            </Button>

            <CustomForm
              title={
                editBrokerId ? "Edit Broker Information" : "Broker Information"
              }
              fields={[
                {
                  label: "Broker Name",
                  name: "brokerName",
                  type: "text",
                  placeholder: "Enter Broker Name",
                  required: true,
                  sm: 6,
                },
                {
                  label: "Phone No.",
                  name: "phone",
                  type: "tel",
                  placeholder: "Enter phone number",
                  required: true,
                  sm: 6,
                },
                {
                  label: "Bank Name",
                  name: "bank",
                  type: "text",
                  placeholder: "Enter Bank Name",
                  sm: 6,
                },
                {
                  label: "Account Number",
                  name: "bankAccount",
                  type: "number",
                  placeholder: "Enter Bank Account Number",
                  sm: 6,
                },
                {
                  label: "IFS Code",
                  name: "ifsc",
                  type: "text",
                  placeholder: "IFSC Code",
                  sm: 12,
                },
              ]}
              handleSubmit={handleSubmit}
              formData={formData}
              handleChange={handleChange}
              buttonText={
                editBrokerId ? "Update Broker Info" : "Submit Broker Info"
              }
            />
            {submitMessage && (
              <Typography
                variant="body1"
                sx={{ color: "#d1a617", textAlign: "center", marginTop: 2 }}
              >
                {submitMessage}
              </Typography>
            )}
          </div>
        </div>
      )}

      <Typography
        sx={{ color: "#F1E7E7", mt: 8, mb: 2 }}
        variant="h4"
        gutterBottom
      >
        Broker List
      </Typography>

      <CustomTable
        columns={columns}
        rows={brokers}
        noDataMessage="No brokers found"
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        ref={dialogRef}
        tabIndex={-1}
      >
        <DialogTitle id="delete-dialog-title">Delete Broker</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete broker{" "}
            <strong>{brokerToDelete?.brokerName}</strong>? This action cannot be
            undone.
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

export default Broker;
