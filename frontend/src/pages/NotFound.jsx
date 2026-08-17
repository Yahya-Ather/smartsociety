import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-center px-6">
      <span className="font-heading font-extrabold text-6xl text-brand-500">404</span>
      <h1 className="font-heading font-bold text-h2 m-0">Page not found</h1>
      <p className="text-body-lg text-slate-500 max-w-md m-0">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
