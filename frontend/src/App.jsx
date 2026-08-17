import { useEffect, useState } from "react";
import AppRoutes from "./routes.jsx";
import Loader from "./components/common/Loader.jsx";

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Loader show={booting} />
      <AppRoutes />
    </>
  );
}
