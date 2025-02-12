import { lazy } from "react";

// Lazy load components to improve performance
const Dashboard = lazy(() => import("./components/pages/Dashboard"));
const Purchase = lazy(() => import("./components/pages/Purchase"));
const Sales = lazy(() => import("./components/pages/Sales"));
const ForwardPurchase = lazy(() =>
  import("./components/pages/ForwardPurchase")
);
const ForwardSell = lazy(() => import("./components/pages/ForwardSell"));
const AllReports = lazy(() => import("./components/pages/AllReports"));
const Create = lazy(() => import("./components/pages/Create"));
const Ledger = lazy(() => import("./components/pages/Ledger"));
const Payments = lazy(() => import("./components/pages/Payments"));
const Notifications = lazy(() => import("./components/pages/Notifications"));
const Profile = lazy(() => import("./components/pages/Profile"));
const Settings = lazy(() => import("./components/pages/Settings"));
const Logout = lazy(() => import("./components/pages/Logout"));
const CompanyForm = lazy(() =>
  import("./components/pages/CreateMenu/CompanyForm")
);
const CompanyList = lazy(() => import("./components/pages/CompanyList"));

// CreateMenu Components
const Broker = lazy(() => import("./components/pages/CreateMenu/Broker"));
const Creditors = lazy(() => import("./components/pages/CreateMenu/Creditors"));
const Debtors = lazy(() => import("./components/pages/CreateMenu/Debtors"));
const Inventory = lazy(() => import("./components/pages/CreateMenu/Inventory"));
const Warehouse = lazy(() => import("./components/pages/CreateMenu/Warehouse"));

// Reports Components
const Stock = lazy(() => import("./components/pages/Reports/Stock"));
const DObook = lazy(() => import("./components/pages/Reports/DObook"));
const PurchaseReg = lazy(() =>
  import("./components/pages/Reports/PurchaseReg")
);
const Outstanding = lazy(() =>
  import("./components/pages/Reports/Outstanding")
);
const ForwardPur = lazy(() => import("./components/pages/Reports/ForwardPur"));
const Forwardsale = lazy(() =>
  import("./components/pages/Reports/Forwardsale")
);

// Define route configuration
const routes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/purchase", element: <Purchase /> },
  { path: "/sales", element: <Sales /> },
  { path: "/forwardPurchase", element: <ForwardPurchase /> },
  { path: "/forwardSell", element: <ForwardSell /> },
  { path: "/allReports", element: <AllReports /> },
  { path: "/create", element: <Create /> },
  { path: "/ledger", element: <Ledger /> },
  { path: "/payments", element: <Payments /> },
  { path: "/notifications", element: <Notifications /> },
  { path: "/profile", element: <Profile /> },
  { path: "/settings", element: <Settings /> },
  { path: "/logout", element: <Logout /> },
  { path: "/broker", element: <Broker /> },
  { path: "/creditors", element: <Creditors /> },
  { path: "/debtors", element: <Debtors /> },
  { path: "/inventory", element: <Inventory /> },
  { path: "/warehouse", element: <Warehouse /> },
  { path: "/stock", element: <Stock /> },
  { path: "/dobook", element: <DObook /> },
  { path: "/purchaseReg", element: <PurchaseReg /> },
  { path: "/outstanding", element: <Outstanding /> },
  { path: "/forwardPur", element: <ForwardPur /> },
  { path: "/forwardsale", element: <Forwardsale /> },
  { path: "/companies", element: <CompanyList /> },
  { path: "/comp-create", element: <CompanyForm /> },
];

export default routes;
