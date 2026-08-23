import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./features/card-programs/styles/cards.css";
import "./features/utility-services/styles/utility.css";
import "./features/partner-directory/styles/partner.css";
import "./features/partner-onboarding/styles/onboarding.css";
import "./features/investor-dashboard/styles/investor.css";
import "./features/investor-reports/styles/reports.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
