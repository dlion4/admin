import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./features/card-programs/styles/cards.css";
import "./features/utility-services/styles/utility.css";
import "./features/partner-directory/styles/partner.css";
import "./features/partner-onboarding/styles/onboarding.css";
import "./features/investor-dashboard/styles/investor.css";
import "./features/investor-reports/styles/reports.css";
import "./features/admin-management/styles/admin.css";
import "./features/permissions-roles/styles/roles.css";
import "./features/audit-log/styles/audit.css";
import "./features/system-config/styles/system.css";
import "./features/api-integrations/styles/api.css";
import "./features/feature-flags/styles/flags.css";
import "./features/notifications/styles/notifications.css";
import "./features/broadcast/styles/broadcast.css";
import "./features/support-queue/styles/support.css";
import "./features/terms-conditions/styles/legal.css";
import "./features/privacy-policy/styles/privacy.css";
import "./features/compliance-docs/styles/compliance.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
