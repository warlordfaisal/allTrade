import { lazy } from "react";
import MainContentWrapper from "./components/MainContentWrapper";

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
  {
    path: "/dashboard",
    element: (
      <MainContentWrapper>
        <Dashboard />
      </MainContentWrapper>
    ),
  },
  {
    path: "/purchase",
    element: (
      <MainContentWrapper>
        <Purchase />
      </MainContentWrapper>
    ),
  },
  {
    path: "/sales",
    element: (
      <MainContentWrapper>
        <Sales />
      </MainContentWrapper>
    ),
  },
  {
    path: "/forwardPurchase",
    element: (
      <MainContentWrapper>
        <ForwardPurchase />
      </MainContentWrapper>
    ),
  },
  {
    path: "/forwardSell",
    element: (
      <MainContentWrapper>
        <ForwardSell />
      </MainContentWrapper>
    ),
  },
  {
    path: "/allReports",
    element: (
      <MainContentWrapper>
        <AllReports />
      </MainContentWrapper>
    ),
  },
  {
    path: "/create",
    element: (
      <MainContentWrapper>
        <Create />
      </MainContentWrapper>
    ),
  },
  {
    path: "/ledger",
    element: (
      <MainContentWrapper>
        <Ledger />
      </MainContentWrapper>
    ),
  },
  {
    path: "/payments",
    element: (
      <MainContentWrapper>
        <Payments />
      </MainContentWrapper>
    ),
  },
  {
    path: "/notifications",
    element: (
      <MainContentWrapper>
        <Notifications />
      </MainContentWrapper>
    ),
  },
  {
    path: "/profile",
    element: (
      <MainContentWrapper>
        <Profile />
      </MainContentWrapper>
    ),
  },
  {
    path: "/settings",
    element: (
      <MainContentWrapper>
        <Settings />
      </MainContentWrapper>
    ),
  },
  {
    path: "/logout",
    element: (
      <MainContentWrapper>
        <Logout />
      </MainContentWrapper>
    ),
  },
  {
    path: "/broker",
    element: (
      <MainContentWrapper>
        <Broker />
      </MainContentWrapper>
    ),
  },
  {
    path: "/creditors",
    element: (
      <MainContentWrapper>
        <Creditors />
      </MainContentWrapper>
    ),
  },
  {
    path: "/debtors",
    element: (
      <MainContentWrapper>
        <Debtors />
      </MainContentWrapper>
    ),
  },
  {
    path: "/inventory",
    element: (
      <MainContentWrapper>
        <Inventory />
      </MainContentWrapper>
    ),
  },
  {
    path: "/warehouse",
    element: (
      <MainContentWrapper>
        <Warehouse />
      </MainContentWrapper>
    ),
  },
  {
    path: "/stock",
    element: (
      <MainContentWrapper>
        <Stock />
      </MainContentWrapper>
    ),
  },
  {
    path: "/dobook",
    element: (
      <MainContentWrapper>
        <DObook />
      </MainContentWrapper>
    ),
  },
  {
    path: "/purchaseReg",
    element: (
      <MainContentWrapper>
        <PurchaseReg />
      </MainContentWrapper>
    ),
  },
  {
    path: "/outstanding",
    element: (
      <MainContentWrapper>
        <Outstanding />
      </MainContentWrapper>
    ),
  },
  {
    path: "/forwardPur",
    element: (
      <MainContentWrapper>
        <ForwardPur />
      </MainContentWrapper>
    ),
  },
  {
    path: "/forwardsale",
    element: (
      <MainContentWrapper>
        <Forwardsale />
      </MainContentWrapper>
    ),
  },
  {
    path: "/companies",
    element: (
      <MainContentWrapper>
        <CompanyList />
      </MainContentWrapper>
    ),
  },
  {
    path: "/comp-create",
    element: (
      <MainContentWrapper>
        <CompanyForm />
      </MainContentWrapper>
    ),
  },
];

export default routes;
