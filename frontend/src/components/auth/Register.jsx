import { Link } from "react-router-dom";
import { Formik, Form } from "formik";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiHome, FiLock, FiArrowRight, FiCheck } from "react-icons/fi";
import { FormField, TextInput } from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import api from "../../services/api.js";
import communityGate from "../../assets/images/community-gated-entrance.png";
import logo from "../../assets/images/logo.png";

const BRAND_GRADIENT = {
  background: "linear-gradient(155deg, #0F2747 0%, #12314F 55%, #0F766E 100%)",
};

// Backend requires occupancyType + a block; residents self-registering only
// pick their flat number, so a fixed default is submitted alongside it.
const DEFAULT_BLOCK = "Tower B";
const DEFAULT_OCCUPANCY = "Owner";

const INITIAL_VALUES = { name: "", email: "", phone: "", flat: "", password: "" };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Full name is required.";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!/^[\d+()\-\s]{7,}$/.test(values.phone)) errors.phone = "Enter a valid phone number.";
  if (!values.flat.trim()) errors.flat = "Flat / unit number is required.";
  if (values.password.length < 8) errors.password = "Needs 8+ characters with one number and one symbol.";
  else if (!/\d/.test(values.password) || !/[^A-Za-z0-9]/.test(values.password)) {
    errors.password = "Needs at least one number and one symbol.";
  }
  return errors;
}

const FIELD_ICON = { name: FiUser, email: FiMail, phone: FiPhone, flat: FiHome, password: FiLock };

export default function Register() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleSubmit(values, { setSubmitting }) {
    setServerError("");
    try {
      await api.post("/auth/register", {
        fullName: values.name,
        email: values.email,
        phone: values.phone,
        flat: values.flat,
        password: values.password,
        block: DEFAULT_BLOCK,
        occupancyType: DEFAULT_OCCUPANCY,
      });
      setSubmitted(true);
    } catch (error) {
      setServerError(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[440px] bg-white border border-slate-200 rounded-panel p-8 flex flex-col gap-4 items-center text-center shadow-md dark:bg-slate-900 dark:border-slate-700"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
            className="w-14 h-14 rounded-full bg-success-bg text-success-fg dark:bg-success-fg/15 flex items-center justify-center"
          >
            <FiCheck size={26} strokeWidth={2.5} />
          </motion.div>
          <h2 className="font-heading font-bold text-h2 m-0">Account created</h2>
          <p className="text-body-lg text-slate-500 dark:text-slate-400 m-0">
            Your details are verified against the society register before access is granted — usually within one
            working day. You'll be notified once your account is active.
          </p>
          <Link to="/login">
            <Button variant="secondary">Back to Log In</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      <div
        className="md:w-[38%] md:flex-shrink-0 px-6 py-8 md:p-12 flex flex-col gap-3 text-white relative overflow-hidden"
        style={BRAND_GRADIENT}
      >
        <img
          src={communityGate}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <Link to="/" className="flex items-center gap-3 !no-underline w-fit relative">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
            <img src={logo} alt="" className="w-full h-full object-contain p-1" />
          </div>
          <span className="font-heading font-bold text-lg text-white" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>SmartSociety</span>
        </Link>
        <div className="relative flex flex-col gap-3" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>
          <h1 className="font-heading font-bold text-2xl md:text-[28px] tracking-tight m-0 mt-2">Register your flat</h1>
          <p className="text-white/95 text-body m-0">
            Only Residents self-register here. Admin and Guard accounts are created internally by the Society Admin.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-start md:items-center justify-center p-6 md:p-12">
        <Formik initialValues={INITIAL_VALUES} validate={validate} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form
              className="w-full max-w-[460px] bg-white border border-slate-200 rounded-panel p-6 md:p-8 flex flex-col gap-4 dark:bg-slate-900 dark:border-slate-700"
              noValidate
            >
              <span className="text-body text-slate-500 dark:text-slate-400">
                Your details are verified against the society register before access is granted — usually within
                one working day.
              </span>

              <FormField label="Full name" error={touched.name && errors.name} required>
                <div className="relative flex items-center">
                  <FiUser size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <TextInput
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    placeholder="Aarav Mehta"
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Email" error={touched.email && errors.email} required>
                <div className="relative flex items-center">
                  <FiMail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <TextInput
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.email && errors.email)}
                    placeholder="you@example.com"
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Phone" error={touched.phone && errors.phone} helper="Used for gate-pass alerts and login codes." required>
                <div className="relative flex items-center">
                  <FiPhone size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <TextInput
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.phone && errors.phone)}
                    placeholder="+91 98204 41207"
                    className="pl-10 font-mono"
                  />
                </div>
              </FormField>

              <FormField label="Flat / unit no." error={touched.flat && errors.flat} required>
                <div className="relative flex items-center">
                  <FiHome size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <TextInput
                    name="flat"
                    value={values.flat}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.flat && errors.flat)}
                    placeholder="1204"
                    className="pl-10 font-mono"
                  />
                </div>
              </FormField>

              <FormField label="Password" error={touched.password && errors.password} required>
                <div className="relative flex items-center">
                  <FiLock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <TextInput
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.password && errors.password)}
                    className="pl-10"
                  />
                </div>
              </FormField>

              {serverError && <span className="text-xs font-semibold text-danger-fg -mt-2">{serverError}</span>}

              <Button type="submit" size="lg" className="w-full group" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account…" : (
                  <>
                    Create Account
                    <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <span className="text-xs text-slate-400 dark:text-slate-500 text-center -mt-1">
                By creating an account you agree to the <Link to="/guidelines">Society Guidelines</Link> and
                consent to your contact details being shared with gate security.
              </span>

              <div className="flex flex-col items-center gap-1.5 text-center pt-1">
                <span className="text-body text-slate-500 dark:text-slate-400">
                  Already registered? <Link to="/login">Log in</Link>
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 max-w-[36ch]">
                  Staff accounts are created by the Society Admin — guards and admins do not self-register.
                </span>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
