import "./App.css";
import Navbar from "./components/navigation/navbar";
import { Button, Typography, Container } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Import BrowserRouter

// Import your Navigation page components
import Dashboard from "./components/pages/Dashboard";
import Purchase from "./components/pages/Purchase";
import Sales from "./components/pages/Sales";
import ForwardPurchase from "./components/pages/ForwardPurchase";
import ForwardSell from "./components/pages/ForwardSell";
import AllReports from "./components/pages/AllReports";
import Create from "./components/pages/Create";
import Ledger from "./components/pages/Ledger";
import Payments from "./components/pages/Payments";
import Notifications from "./components/pages/Notifications";
import Profile from "./components/pages/Profile";
import Settings from "./components/pages/Settings";
import Logout from "./components/pages/Logout";

// Import from "./components/pages/Create
import Broker from "./components/pages/CreateMenu/Broker";
import Creditors from "./components/pages/CreateMenu/creditors";
import Debtors from "./components/pages/CreateMenu/debtors";
import Inventory from "./components/pages/CreateMenu/inventory";
import Warehouse from "./components/pages/CreateMenu/warehouse";

// Import from "./components/pages/Reports
import Stock from "./components/pages/Reports/stock";
import DObook from "./components/pages/Reports/DObook";
import PurchaseReg from "./components/pages/Reports/PurchaseReg";
import Outstanding from "./components/pages/Reports/Outstanding";
import ForwardPur from "./components/pages/Reports/ForwardPur";
import Forwardsale from "./components/pages/Reports/Forwardsale";

function App() {
  return (
    <BrowserRouter>
      <Container>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/forwardPurchase" element={<ForwardPurchase />} />
          <Route path="/forwardSell" element={<ForwardSell />} />
          <Route path="/allReports" element={<AllReports />} />
          <Route path="/create" element={<Create />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/Broker" element={<Broker />} />
          <Route path="/Creditors" element={<Creditors />} />
          <Route path="/Debtors" element={<Debtors />} />
          <Route path="/Inventory" element={<Inventory />} />
          <Route path="/Warehouse" element={<Warehouse />} />
          <Route path="/Stock" element={<Stock />} />
          <Route path="/DObook" element={<DObook />} />
          <Route path="/PurchaseReg" element={<PurchaseReg />} />
          <Route path="/Outstanding" element={<Outstanding />} />
          <Route path="/ForwardPur" element={<ForwardPur />} />
          <Route path="/Forwardsale" element={<Forwardsale />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
