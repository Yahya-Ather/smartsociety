import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import api from "../../services/api.js";

const HOLD_MS = 3000;

export default function Footer() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fired, setFired] = useState(false);
  const [triggerError, setTriggerError] = useState("");
  const rafRef = useRef(null);
  const startRef = useRef(null);

  function openConfirm() {
    setFired(false);
    setProgress(0);
    setTriggerError("");
    setConfirmOpen(true);
  }

  function closeConfirm() {
    cancelHold();
    setConfirmOpen(false);
  }

  async function triggerSiren() {
    try {
      await api.post("/emergency/trigger");
      setFired(true);
    } catch (err) {
      setTriggerError(err.response?.data?.message || "Couldn't reach the server — try again.");
    }
  }

  function startHold() {
    setHolding(true);
    startRef.current = performance.now();
    const tick = (now) => {
      const pct = Math.min(100, ((now - startRef.current) / HOLD_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        setHolding(false);
        triggerSiren();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function cancelHold() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setHolding(false);
    if (!fired) setProgress(0);
  }

  return (
    <>
      <footer className="bg-white border-t-[3px] border-slate-100 dark:bg-slate-900 dark:border-slate-800 mt-auto pb-36 md:pb-0 md:fixed md:inset-x-0 md:bottom-0 md:z-40 md:mt-0 md:shadow-[0_-4px_16px_rgba(16,28,48,0.06)]">
        <div className="px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-body text-slate-400 dark:text-slate-500">
            <span>© 2026 Green Valley Residents' Welfare Association</span>
            <Link to="/emergency-directory" className="font-semibold no-underline">Emergency Contact Directory</Link>
            <Link to="/guidelines" className="font-semibold no-underline">Society Guidelines</Link>
          </div>
          {/* Desktop: inline siren button. Mobile gets its own pinned bar below,
              per Design System §06 ("becomes a full-width 52px button pinned
              above the bottom tab bar") — not duplicated here. */}
          <Button variant="emergency" onClick={openConfirm} className="hidden md:inline-flex">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            Emergency Siren
          </Button>
        </div>
      </footer>

      <div className="md:hidden fixed inset-x-0 bottom-16 z-30 px-3 pb-2 pt-3 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 pointer-events-none">
        <Button
          variant="emergency"
          size="lg"
          onClick={openConfirm}
          className="w-full shadow-lg pointer-events-auto"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          Emergency Siren
        </Button>
      </div>

      <Modal
        open={confirmOpen}
        onClose={closeConfirm}
        title={fired ? "Emergency siren activated" : "Hold to confirm"}
        subtitle={
          fired
            ? "Gate, admin and all residents have been alerted."
            : "Press and hold the button for 3 seconds. This alerts the gate, admin and every resident — it never fires on a single tap."
        }
        footer={
          <Button variant="secondary" onClick={closeConfirm}>
            {fired ? "Close" : "Cancel"}
          </Button>
        }
      >
        {!fired && (
          <button
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            className="relative h-16 rounded-lg bg-emergency text-white font-bold text-lg overflow-hidden select-none"
          >
            <span
              className="absolute inset-y-0 left-0 bg-emergency-dark transition-[width]"
              style={{ width: `${progress}%`, transitionDuration: holding ? "0ms" : "150ms" }}
            />
            <span className="relative">{holding ? "Keep holding…" : "Hold here"}</span>
          </button>
        )}
        {!fired && triggerError && (
          <span className="text-body font-semibold text-danger-fg">{triggerError}</span>
        )}
        {fired && (
          <div className="flex items-center gap-3 rounded-lg bg-success-bg text-success-fg px-4 py-3.5 font-semibold">
            Siren is live. Gate, admin and every resident have been notified in real time.
          </div>
        )}
      </Modal>
    </>
  );
}
