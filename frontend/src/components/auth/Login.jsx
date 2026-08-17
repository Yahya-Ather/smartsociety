import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { FormField, TextInput } from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import communityPool from "../../assets/images/community-evening-pool.png";
import logo from "../../assets/images/logo.png";

const BRAND_GRADIENT = {
  background: "linear-gradient(155deg, #0F2747 0%, #12314F 55%, #0F766E 100%)",
};

// Matches the accounts created by Backend/src/scripts/seedUsers.js.
const DEMO_CREDENTIALS = [
  { role: "resident", username: "Resident", password: "resident123" },
  { role: "admin", username: "Admin", password: "admin123" },
  { role: "guard", username: "guard.gate2", password: "guard123" },
];

function validateCredentials(values) {
  const errors = {};
  if (!values.username.trim()) errors.username = "Username is required.";
  if (!values.password) errors.password = "Password is required.";
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleSubmit(values, { setSubmitting }) {
    setServerError("");
    const result = await login(values.username, values.password);
    setSubmitting(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    navigate(`/${result.user.role}`);
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300 ${theme === "dark" ? "dark" : ""}`}>
      <div
        className="md:w-[42%] md:flex-shrink-0 px-6 py-8 md:p-12 flex flex-col justify-between gap-8 text-white relative overflow-hidden"
        style={BRAND_GRADIENT}
      >
        <img
          src={communityPool}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <Link to="/" className="flex items-center gap-3 !no-underline w-fit relative">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden">
            <img src={logo} alt="" className="w-full h-full object-contain p-1" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-white" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>SmartSociety</span>
        </Link>

        <div className="flex flex-col gap-5 relative" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.65)" }}>
          <h1 className="font-heading font-extrabold text-[32px] md:text-[40px] leading-[1.1] tracking-tight m-0 max-w-[16ch]">
            Smarter living, safer community.
          </h1>
          <p className="text-white/90 text-body-lg leading-relaxed max-w-[42ch] m-0">
            One portal for maintenance dues, gate passes, complaints and amenity bookings — audited end to end.
          </p>
          <ul className="flex flex-col gap-3 pt-2 list-none m-0 p-0">
            {[
              "Gate pass verified in under 2 seconds",
              "Every entry, edit and payment logged immutably",
              "Role-based access for residents, admins and guards",
            ].map((line) => (
              <li key={line} className="flex items-center gap-2.5 text-body-lg text-white">
                <span className="w-2 h-2 rounded-full bg-teal-300 flex-shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="hidden md:flex gap-7 font-mono text-[11px] leading-relaxed text-white/90 relative"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}
        >
          <span>GREEN VALLEY{"\n"}RESIDENTS' WELFARE ASSN.</span>
          <span>412 FLATS{"\n"}3 TOWERS · 3 GATES</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px] flex flex-col gap-5">
          <Formik
            initialValues={{ username: "", password: "" }}
            validate={validateCredentials}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className="bg-white border border-slate-200 rounded-panel p-6 md:p-8 flex flex-col gap-5 shadow-md dark:bg-slate-900 dark:border-slate-700">
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-heading font-bold text-[26px] tracking-tight m-0">Log in to your account</h2>
                  <span className="text-body text-slate-500 dark:text-slate-400">You'll land on the dashboard for your role.</span>
                </div>

                <FormField label="Username" error={touched.username && errors.username}>
                  <div className="relative flex items-center">
                    <FiUser size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <TextInput
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Resident"
                      className="pl-10"
                      error={Boolean(touched.username && errors.username)}
                      autoFocus
                    />
                  </div>
                </FormField>

                <FormField label="Password" error={touched.password && errors.password}>
                  <div className="relative flex items-center">
                    <FiLock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <TextInput
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="pl-10 pr-11"
                      error={Boolean(touched.password && errors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3.5 text-slate-400 hover:text-brand-500 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </FormField>

                {serverError && <span className="text-body font-semibold text-danger-fg -mt-2">{serverError}</span>}

                <Button type="submit" size="lg" className="w-full group" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in…" : (
                    <>
                      Log In
                      <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-body text-slate-500 dark:text-slate-400">
              New resident? <Link to="/register">Create an account</Link>
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 max-w-[34ch]">
              Staff accounts (Admin, Security) are created by the Society Admin.
            </span>
            <details className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              <summary className="cursor-pointer">Demo credentials</summary>
              <div className="mt-2 flex flex-col gap-1 font-mono text-left">
                {DEMO_CREDENTIALS.map((u) => (
                  <span key={u.role}>
                    {u.role}: {u.username} / {u.password}
                  </span>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
