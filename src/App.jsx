import "./App.css";
import React, { useState, useEffect, Suspense } from "react";
import { CircularProgress, Container } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navigation/Navbar";
import routes from "./routes";
import CompanyList from "./components/pages/CompanyList";
import CompanyForm from "./components/pages/CreateMenu/CompanyForm";

function App() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/companies")
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Container>
        <Suspense fallback={<CircularProgress />}>
          {!selectedCompany ? (
            <Routes>
              <Route
                path="/"
                element={<CompanyList onCompanySelect={setSelectedCompany} />}
              />
              <Route path="/comp-create" element={<CompanyForm />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          ) : (
            <>
              <Navbar />
              <Routes>
                {/* Redirect to dashboard after selecting a company */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                {routes.map(({ path, element }, index) => (
                  <Route key={index} path={path} element={element} />
                ))}
                <Route path="*" element={<h1>404 Not Found</h1>} />
              </Routes>
            </>
          )}
        </Suspense>
      </Container>
    </BrowserRouter>
  );
}

export default App;
