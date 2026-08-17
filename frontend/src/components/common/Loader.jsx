import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/images/logo.png";

// Full-screen branded splash shown while the app boots. Kept out of the
// route tree (mounted once in App.jsx) so it never re-triggers on
// client-side navigation — only on the initial hard load.
export default function Loader({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-[#F2F6FC] dark:bg-slate-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          <motion.div
            className="relative w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-[0_18px_40px_rgba(18,101,200,0.35)] overflow-hidden"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src={logo} alt="" className="w-full h-full object-contain p-2" />
            <motion.span
              className="absolute inset-0 rounded-2xl border-2 border-brand-400"
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-heading font-bold text-lg text-brand-700 dark:text-slate-100">SmartSociety</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Smarter living, safer community</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
