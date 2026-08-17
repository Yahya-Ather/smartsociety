import { useState } from "react";
import Navbar from "./Navbar.jsx";
import Sidebar, { MobileBottomNav } from "./Sidebar.jsx";
import Footer from "./Footer.jsx";
import EmergencyBanner from "./EmergencyBanner.jsx";

export default function DashboardLayout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar onMenuClick={() => setMobileNavOpen(true)} />
      <EmergencyBanner />
      <div className="flex-1 flex items-start max-w-[1440px] w-full mx-auto">
        <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
        <main className="flex-1 min-w-0 p-4 md:p-6 pb-6 md:pb-24">{children}</main>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
