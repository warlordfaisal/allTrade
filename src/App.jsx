import "./App.css";
import React, { useState, useEffect, Suspense } from "react";
import { CircularProgress, Container } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/navigation/Navbar";
import routes from "./routes";
import CompanyList from "./components/pages/CompanyList";

function App() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompanyDatabaseCreated, setIsCompanyDatabaseCreated] =
    useState(false);

  useEffect(() => {
    fetch("/api/companies")
      .then((response) => response.json())
      .then((data) => {
        setIsCompanyDatabaseCreated(data.length > 0);
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

  // If no company is selected, show CompanyList
  if (!selectedCompany) {
    return <CompanyList onCompanySelect={setSelectedCompany} />;
  }

  return (
    <BrowserRouter>
      <Container>
        <Suspense fallback={<CircularProgress />}>
          <Navbar />
        </Suspense>

        <Suspense fallback={<CircularProgress />}>
          <Routes>
            {routes.map(({ path, element }, index) => (
              <Route key={index} path={path} element={element} />
            ))}
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </Suspense>
      </Container>
    </BrowserRouter>
  );
}

export default App;
