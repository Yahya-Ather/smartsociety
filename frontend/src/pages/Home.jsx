import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiCheck, FiPlay } from "react-icons/fi";
import { FaXTwitter, FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa6";
import {
  IconVisitorPass,
  IconBillingEngine,
  IconComplaints,
  IconAmenity,
  IconNotices,
  IconSecurity,
  IconLock,
  IconCheckShield,
  IconAudit,
  IconMonitor,
  IconArrowRight,
} from "../components/common/icons.jsx";
import ThemeToggle from "../components/common/ThemeToggle.jsx";
import communityCourtyard from "../assets/images/community-courtyard-day.png";
import communityGuard from "../assets/images/community-security-guard.png";
import communityPool from "../assets/images/community-evening-pool.png";
import communityGate from "../assets/images/community-gated-entrance.png";
import communityVideo from "../assets/video/community-environment.mp4";
import logo from "../assets/images/logo.png";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Roles", href: "#roles" },
  { label: "Contact", href: "#contact" },
];

const FEATURES = [
  {
    icon: IconVisitorPass,
    tile: "from-brand-100 to-teal-100",
    iconColor: "#12314F",
    title: "Visitor QR passes",
    desc: "Residents pre-approve guests, cabs and deliveries with a time-boxed QR the guard clears in under two seconds.",
  },
  {
    icon: IconBillingEngine,
    tile: "from-teal-100 to-brand-100",
    iconColor: "#0B5C56",
    title: "Automated billing",
    desc: "A whole month of invoices in one pass, penalty rules applied on schedule, collections visible as they close.",
  },
  {
    icon: IconComplaints,
    tile: "from-brand-100 to-teal-100",
    iconColor: "#12314F",
    title: "Complaint tracking",
    desc: "Photo-backed tickets routed to the right technician, with SLA timers and a thread the resident can follow.",
  },
  {
    icon: IconAmenity,
    tile: "from-teal-100 to-brand-100",
    iconColor: "#0B5C56",
    title: "Amenity booking",
    desc: "Live slot availability for the clubhouse, pool and courts — deposits, guest caps, no double bookings.",
  },
  {
    icon: IconNotices,
    tile: "bg-warning-bg",
    iconColor: "#92400E",
    title: "Digital notices & polling",
    desc: "Announcements that don't scroll away, and one-flat-one-vote polls with results everybody can audit.",
  },
  {
    icon: IconSecurity,
    tile: "bg-danger-bg",
    iconColor: "#991B1B",
    title: "Real-time security logs",
    desc: "Every entry and exit, append-only, with overstay alerts the committee sees the moment they trigger.",
  },
];

const STEPS = [
  {
    title: "Register your flat",
    desc: "Owner or tenant, with your block, unit and move-in date.",
    badge: "from-brand-500 to-teal-500",
  },
  {
    title: "Get verified",
    desc: "Your society admin confirms the unit and opens your portal.",
    badge: "from-brand-500 to-teal-500",
  },
  {
    title: "Manage bills, passes & complaints",
    desc: "Everything the office used to handle, from your own screen.",
    badge: "from-teal-500 to-teal-300",
  },
  {
    title: "Live in a smarter community",
    desc: "Fewer queues at the gate, fewer disputes in the group chat.",
    badge: "bg-success-fg",
  },
];

const TRUST_BADGES = [
  { icon: IconLock, tile: "bg-brand-100", iconColor: "#12314F", title: "Encrypted", desc: "TLS in transit, AES at rest." },
  {
    icon: IconCheckShield,
    tile: "bg-teal-100",
    iconColor: "#0B5C56",
    title: "Role-based access",
    desc: "Enforced server-side, per route.",
  },
  { icon: IconAudit, tile: "bg-slate-100", iconColor: "#64748B", title: "Audit logged", desc: "Append-only, retained 24 months." },
  {
    icon: IconMonitor,
    tile: "bg-success-bg",
    iconColor: "#16A34A",
    title: "24/7 monitoring",
    desc: "Uptime and overstay alerting.",
  },
];

const ROLE_DATA = {
  resident: {
    tab: "Resident",
    roleTag: "Resident portal",
    title: "Your flat, in your pocket",
    body: "Pay maintenance, raise a complaint with photos, pre-approve a guest and book the clubhouse — without ever calling the society office.",
    chips: ["Visitor passes", "Bills & receipts", "Amenity slots"],
    image: "courtyard",
    imageCaption: "Community life, without the queue at the office",
  },
  admin: {
    tab: "Admin",
    roleTag: "Admin console",
    title: "The whole society, one screen",
    body: "Onboard residents, generate a month of invoices in one pass, route complaints to the right technician and audit every gate record.",
    chips: ["Billing engine", "Complaint routing", "Occupancy map"],
    image: "gate",
    imageCaption: "412 flats, 4 towers, one dashboard",
  },
  guard: {
    tab: "Guard",
    roleTag: "Gate terminal",
    title: "Clear the gate in one tap",
    body: "Scan a resident's QR or key the six-digit gate code, log walk-ins with a photo, and see instantly who is still inside past their window.",
    chips: ["QR verification", "Walk-in entry", "Overstay alerts"],
    image: "guard",
    imageCaption: "Every entry verified in under 2 seconds",
  },
};

const ROLE_IMAGE = { courtyard: communityCourtyard, gate: communityGate, guard: communityGuard };

function useScrolled(threshold = 80) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function Blob({ className, color, duration = 22, dx = 34, dy = -26, scale = 1.12 }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`absolute rounded-full blur-[100px] pointer-events-none opacity-55 dark:opacity-30 ${className}`}
      style={{ background: color }}
      animate={{ x: [0, dx, 0], y: [0, dy, 0], scale: [1, scale, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function GlassButton({ as: Tag = Link, className = "", children, ...props }) {
  return (
    <Tag
      className={`h-11 md:h-[42px] px-5 rounded-full bg-white/70 backdrop-blur-xl border border-white/85 text-brand-600 font-bold text-body-lg flex items-center justify-center hover:bg-white/90 transition-colors dark:bg-slate-800/70 dark:border-slate-600/70 dark:text-teal-300 dark:hover:bg-slate-800/90 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

function GradientButton({ as: Tag = Link, className = "", children, ...props }) {
  return (
    <Tag
      className={`h-14 px-8 rounded-full bg-gradient-to-r from-brand-500 to-teal-500 text-white font-extrabold text-body-lg flex items-center justify-center gap-2.5 shadow-[0_10px_28px_rgba(18,101,200,0.38)] hover:shadow-[0_14px_36px_rgba(14,154,148,0.5)] transition-shadow ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

function PhotoCard({ src, alt, caption, className = "" }) {
  return (
    <div className={`relative rounded-[28px] overflow-hidden shadow-[0_28px_64px_rgba(15,39,71,0.24)] ${className}`}>
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      {caption && (
        <>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(15,39,71,0.75), rgba(15,39,71,0.05) 55%, rgba(15,39,71,0) 75%)" }}
          />
          <div className="absolute left-5 right-5 bottom-5 md:left-6 md:bottom-6">
            <span className="font-heading font-semibold text-body-lg text-white">{caption}</span>
          </div>
        </>
      )}
    </div>
  );
}

function LandingNav() {
  const scrolled = useScrolled(80);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 -mb-16 md:-mb-[72px] transition-colors duration-300 ${
        scrolled
          ? "bg-white/75 backdrop-blur-xl border-b border-white/70 shadow-sm dark:bg-slate-900/80 dark:border-slate-700/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto h-16 md:h-[72px] px-5 md:px-10 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 md:w-[34px] md:h-[34px] rounded-[10px] bg-white shadow-[0_1px_4px_rgba(15,39,71,0.25)] flex items-center justify-center overflow-hidden">
            <img src={logo} alt="SmartSociety" className="w-full h-full object-contain p-1" />
          </div>
          <span className="font-heading font-bold text-lg md:text-xl text-brand-700 dark:text-slate-100">SmartSociety</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="relative text-body-lg font-semibold text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-white !no-underline group"
            >
              {link.label}
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-brand-500 to-teal-500 transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle className="bg-white/70 backdrop-blur-xl border border-white/85 text-brand-600 hover:bg-white/90 dark:bg-slate-800/70 dark:border-slate-600/70 dark:text-teal-300 dark:hover:bg-slate-800/90" />
          <GlassButton as={Link} to="/login" className="!no-underline">
            Log In
          </GlassButton>
          <GradientButton as={Link} to="/register" className="!h-[42px] !px-[22px] !text-[15px] !no-underline">
            Register
          </GradientButton>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle className="bg-white/60 border border-white/85 text-slate-700 hover:bg-white/90 dark:bg-slate-800/70 dark:border-slate-600/70 dark:text-teal-300" />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="w-10 h-10 rounded-xl bg-white/60 border border-white/85 flex items-center justify-center text-slate-700 hover:bg-white/90 transition-colors dark:bg-slate-800/70 dark:border-slate-600/70 dark:text-slate-200"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white/90 backdrop-blur-xl border-t border-white/70 dark:bg-slate-900/95 dark:border-slate-700/60"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-body-lg font-semibold text-slate-700 dark:text-slate-200 !no-underline"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2.5 pt-3">
                <Link to="/login" className="flex-1 h-11 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-brand-600 dark:text-teal-300 !no-underline">
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 h-11 rounded-full bg-gradient-to-r from-brand-500 to-teal-500 flex items-center justify-center font-bold text-white !no-underline"
                >
                  Register
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default function Home() {
  const [activeRole, setActiveRole] = useState("resident");
  const role = ROLE_DATA[activeRole];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Sticky nav lives at the page's top level, not nested inside the hero —
          position:sticky only stays stuck while scrolling within its own parent's
          box, so nesting it inside the (much shorter) hero made it stop sticking
          as soon as the hero scrolled out of view. */}
      <LandingNav />

      {/* ============ HERO ============ */}
      <div className="relative bg-[#F2F6FC] dark:bg-slate-950">
        {/* Blobs get their own clipped layer so the hero itself never constrains
            overflow — that was clipping the stats band below whenever a label wrapped. */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Blob className="w-[380px] h-[380px] md:w-[620px] md:h-[620px] -top-40 -left-28 md:-top-56 md:-left-40" color="#4C7098" duration={20} dx={30} dy={-22} />
          <Blob className="w-[340px] h-[340px] md:w-[560px] md:h-[560px] top-40 -right-36 md:top-16 md:-right-44" color="#0F766E" duration={26} dx={-28} dy={24} />
          <Blob className="hidden md:block w-[480px] h-[480px] -bottom-60 left-[38%]" color="#38BDF8" duration={30} dx={22} dy={-18} scale={1.08} />
        </div>

        {/* pt includes the nav's own height (64px / 72px) since the nav overlaps
            this section transparently via negative margin above. */}
        <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 pt-[104px] md:pt-[136px] pb-40 md:pb-32 grid lg:grid-cols-[1fr_560px] gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-5 md:gap-6"
          >
            <span className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/85 text-brand-700 text-xs md:text-sm font-bold dark:bg-slate-800/70 dark:border-slate-600/70 dark:text-teal-300">
              <span className="w-2 h-2 rounded-full bg-success-fg animate-live-pulse" />
              Trusted by 500+ societies across Pakistan
            </span>

            <h1 className="font-heading font-extrabold text-[36px] md:text-[62px] leading-[1.22] md:leading-[1.18] tracking-tight text-slate-800 dark:text-slate-50 max-w-[18ch]">
              Smarter living,{" "}
              <span className="inline-block pb-1 md:pb-1.5 bg-gradient-to-r from-brand-700 to-teal-600 dark:from-teal-300 dark:to-sky-300 bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(10,61,122,0.18)]">
                safer community
              </span>
              .
            </h1>

            <p className="text-body-lg md:text-lg leading-relaxed text-[#45536B] dark:text-slate-400 max-w-[54ch]">
              One platform for gate security, maintenance billing, complaints and amenity bookings — with a
              purpose-built portal for residents, society admins and security guards.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <GradientButton as={Link} to="/register" className="!no-underline">
                Get Started
              </GradientButton>
              <GlassButton as="a" href="#features" className="!h-14 !px-6 gap-2.5">
                Learn More
                <IconArrowRight size={16} />
              </GlassButton>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-1">
              {["Free for the first tower", "Live in an afternoon"].map((line) => (
                <span key={line} className="inline-flex items-center gap-2 text-sm text-[#45536B] dark:text-slate-400">
                  <FiCheck size={15} color="#16A34A" strokeWidth={2.5} />
                  {line}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <PhotoCard
              src={communityCourtyard}
              alt="Residents walking through a SmartSociety-managed community courtyard"
              caption="Green Valley · Block B courtyard"
              className="aspect-[4/3]"
            />
          </motion.div>
        </div>
      </div>

      {/* ============ FEATURES ============ */}
      <section id="features" className="relative overflow-hidden bg-[#F7FAFD] dark:bg-slate-900 pt-20 md:pt-24 pb-20 md:pb-24">
        <Blob className="w-[380px] h-[380px] md:w-[520px] md:h-[520px] -top-40 -right-36 md:-top-40 md:-right-44" color="#0F766E" duration={26} dx={-20} dy={18} scale={1.06} />
        <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 flex flex-col gap-10 md:gap-14">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-col gap-3 max-w-[62ch]">
              <span className="font-mono text-xs text-brand-600 dark:text-teal-300 font-semibold">FEATURES</span>
              <h2 className="font-heading font-extrabold text-[28px] md:text-[40px] leading-[1.15] tracking-tight text-slate-800 dark:text-slate-50 m-0">
                Everything the register, the ledger and the notice board used to do.
              </h2>
              <p className="text-body-lg md:text-lg text-slate-500 dark:text-slate-400 m-0">
                Six surfaces, one record of truth. No paper registers, no spreadsheet ledgers, no notices lost
                in a group chat.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, tile, iconColor, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="h-full p-7 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,28,48,0.08)] flex flex-col gap-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(18,101,200,0.18)] hover:border-brand-200 dark:bg-slate-800/70 dark:border-slate-700 dark:hover:border-teal-500/50">
                  <span className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center ${tile.startsWith("bg-") ? tile : `bg-gradient-to-br ${tile}`}`}>
                    <Icon size={26} color={iconColor} />
                  </span>
                  <span className="font-heading font-bold text-xl text-slate-800 dark:text-slate-100">{title}</span>
                  <span className="text-body-lg text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ROLES ============ */}
      <section id="roles" className="relative overflow-hidden bg-[#F2F6FC] dark:bg-slate-950 py-20 md:py-24">
        <Blob className="w-[360px] h-[360px] md:w-[560px] md:h-[560px] -bottom-44 -right-32 md:-bottom-48 md:-right-36" color="#4C7098" duration={22} dx={-26} dy={20} scale={1.08} />
        <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 flex flex-col gap-8 md:gap-10">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex flex-col gap-3 max-w-[52ch]">
              <span className="font-mono text-xs text-teal-700 dark:text-teal-300 font-bold">ROLES</span>
              <h2 className="font-heading font-extrabold text-[28px] md:text-[40px] leading-[1.15] tracking-tight text-slate-800 dark:text-slate-50 m-0">
                Built for every role.
              </h2>
              <p className="text-body-lg md:text-lg text-slate-600 dark:text-slate-400 m-0">
                Three portals, one dataset — everyone sees exactly their own slice of the society.
              </p>
            </div>
            <div className="flex gap-2.5 overflow-x-auto">
              {Object.entries(ROLE_DATA).map(([key, r]) => {
                const active = activeRole === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveRole(key)}
                    className={`flex-shrink-0 h-12 px-5 md:px-6 rounded-full border-2 font-bold text-body-lg transition-colors ${
                      active
                        ? "bg-gradient-to-r from-brand-500 to-teal-500 text-white border-white/50"
                        : "bg-white/70 backdrop-blur-xl text-slate-600 border-white/80 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-600/70"
                    }`}
                  >
                    {r.tab}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="p-6 md:p-8 rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,28,48,0.1)] dark:bg-slate-900/70 dark:border-slate-700/60">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="grid lg:grid-cols-[1fr_480px] gap-8 lg:gap-10 items-center"
              >
                <div className="flex flex-col gap-4 md:gap-5">
                  <span className="inline-flex self-start px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-100 to-teal-100 text-brand-600 dark:from-brand-500/20 dark:to-teal-500/20 dark:text-teal-300 text-sm font-bold">
                    {role.roleTag}
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl md:text-[34px] leading-[1.15] tracking-tight text-slate-800 dark:text-slate-50 m-0">
                    {role.title}
                  </h3>
                  <p className="text-body-lg md:text-lg leading-relaxed text-slate-500 dark:text-slate-400 max-w-[46ch] m-0">
                    {role.body}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {role.chips.map((chip) => (
                      <span key={chip} className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-semibold dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300">
                        {chip}
                      </span>
                    ))}
                  </div>
                  <Link to="/register" className="inline-flex items-center gap-1.5 text-body-lg font-semibold text-brand-600 dark:text-teal-300">
                    Take the {role.tab.toLowerCase()} tour
                    <IconArrowRight size={16} />
                  </Link>
                </div>

                <PhotoCard
                  src={ROLE_IMAGE[role.image]}
                  alt={`${role.tab} at a SmartSociety-managed community`}
                  caption={role.imageCaption}
                  className="aspect-[4/3]"
                />
              </motion.div>
            </AnimatePresence>
          </Reveal>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="relative overflow-hidden bg-[#F7FAFD] dark:bg-slate-900 py-20 md:py-24">
        <Blob className="w-[340px] h-[340px] md:w-[500px] md:h-[500px] -bottom-44 -right-32 md:-bottom-52 md:-right-36" color="#7DD3FC" duration={28} dx={-18} dy={-16} scale={1.05} />
        <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 flex flex-col gap-10 md:gap-12">
          <Reveal className="flex flex-col gap-3 max-w-[56ch]">
            <span className="font-mono text-xs text-brand-600 dark:text-teal-300 font-semibold">HOW IT WORKS</span>
            <h2 className="font-heading font-extrabold text-[28px] md:text-[40px] leading-[1.15] tracking-tight text-slate-800 dark:text-slate-50 m-0">
              Four steps from register to routine.
            </h2>
          </Reveal>

          {/* Mobile — vertical stepper */}
          <div className="flex flex-col lg:hidden">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.15} className="flex gap-4">
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-extrabold text-white text-body-lg shadow-[0_6px_16px_rgba(18,101,200,0.3)] ${
                      step.badge.startsWith("bg-") ? step.badge : `bg-gradient-to-br ${step.badge}`
                    }`}
                  >
                    {i + 1}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="flex-1 w-0.5 min-h-[28px] bg-gradient-to-b from-brand-500 to-teal-500 opacity-50" />
                  )}
                </div>
                <div className={`flex flex-col gap-1.5 ${i < STEPS.length - 1 ? "pb-6" : ""}`}>
                  <span className="font-heading font-bold text-lg text-slate-800 dark:text-slate-100">{step.title}</span>
                  <span className="text-body-lg text-slate-500 dark:text-slate-400">{step.desc}</span>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Desktop — horizontal flow */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-0">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.15} className={i < STEPS.length - 1 ? "pr-7" : ""}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-heading font-extrabold text-white text-lg shadow-[0_8px_20px_rgba(18,101,200,0.32)] flex-shrink-0 ${
                        step.badge.startsWith("bg-") ? step.badge : `bg-gradient-to-br ${step.badge}`
                      }`}
                    >
                      {i + 1}
                    </span>
                    {i < STEPS.length - 1 && <span className="flex-1 h-0.5 bg-gradient-to-r from-brand-500 to-teal-500 opacity-50" />}
                  </div>
                  <span className="font-heading font-bold text-xl text-slate-800 dark:text-slate-100">{step.title}</span>
                  <span className="text-body-lg text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ENVIRONMENT VIDEO ============ */}
      <section className="relative bg-white dark:bg-slate-950 py-20 md:py-24">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10">
          <Reveal className="flex flex-col gap-3 max-w-[56ch] mb-8 md:mb-10">
            <span className="font-mono text-xs text-teal-700 dark:text-teal-300 font-bold">LIFE HERE</span>
            <h2 className="font-heading font-extrabold text-[28px] md:text-[40px] leading-[1.15] tracking-tight text-slate-800 dark:text-slate-50 m-0">
              A community you can actually see.
            </h2>
            <p className="text-body-lg md:text-lg text-slate-500 dark:text-slate-400 m-0">
              Real towers, real gates, real green space — this is the kind of place SmartSociety was built to run.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="relative rounded-[28px] overflow-hidden shadow-[0_24px_64px_rgba(15,39,71,0.22)] aspect-video">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={communityVideo}
              autoPlay
              loop
              muted
              playsInline
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(15,39,71,0.7), rgba(15,39,71,0) 55%)" }}
            />
            <div className="absolute left-6 bottom-6 md:left-9 md:bottom-9 flex items-center gap-2.5 text-white">
              <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <FiPlay size={14} />
              </span>
              <span className="font-heading font-bold text-body-lg">Smarter living, safer community</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SECURITY & TRUST ============ */}
      <section className="relative overflow-hidden bg-[#F2F6FC] dark:bg-slate-950 py-20 md:py-24">
        <Blob className="w-[340px] h-[340px] md:w-[500px] md:h-[500px] -bottom-40 -right-32 md:-bottom-52 md:-right-36" color="#0F766E" duration={24} dx={-16} dy={14} scale={1.04} />
        <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 grid lg:grid-cols-[1fr_480px] gap-10 lg:gap-12 items-center">
          <Reveal className="flex flex-col gap-4">
            <span className="font-mono text-xs text-danger-fg font-semibold">SECURITY &amp; TRUST</span>
            <h2 className="font-heading font-extrabold text-[26px] md:text-[36px] leading-[1.18] tracking-tight text-slate-800 dark:text-slate-50 m-0">
              Built like the data it holds matters.
            </h2>
            <p className="text-body-lg md:text-lg leading-relaxed text-slate-500 dark:text-slate-400 max-w-[58ch] m-0">
              Resident data is encrypted in transit and at rest. Every gate record is append-only — no admin
              can alter or delete a logged entry, and each action carries the identity that performed it. Roles
              are enforced server-side: a guard never opens a billing ledger, a resident never sees another
              flat's ticket.
            </p>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              {TRUST_BADGES.map(({ icon: Icon, tile, iconColor, title, desc }) => (
                <div key={title} className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col gap-2.5">
                  <span className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center ${tile}`}>
                    <Icon size={21} color={iconColor} />
                  </span>
                  <span className="text-body-lg font-bold text-slate-800 dark:text-slate-100">{title}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative rounded-[28px] overflow-hidden shadow-[0_24px_56px_rgba(15,39,71,0.22)] aspect-[4/5]">
            <img
              src={communityGuard}
              alt="Security guard on duty at a SmartSociety-managed gate"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(15,39,71,0.8), rgba(15,39,71,0.15) 45%, rgba(15,39,71,0) 75%)" }}
            />
            <div className="absolute left-5 right-5 bottom-5 md:left-7 md:bottom-7 flex flex-col gap-1">
              <span className="font-heading font-bold text-lg text-white">On the gate, in real time</span>
              <span className="text-sm text-white/85">Every pass verified, every visitor logged.</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <img
          src={communityPool}
          alt="A SmartSociety-managed community at dusk"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(15,39,71,0.94), rgba(15,39,71,0.82) 55%, rgba(15,118,110,0.82))" }}
        />
        <Reveal className="relative max-w-[720px] mx-auto px-5 md:px-10 flex flex-col items-center gap-5 md:gap-6 text-center">
          <h2 className="font-heading font-extrabold text-[30px] md:text-[46px] leading-[1.1] tracking-tight text-white m-0 max-w-[22ch]">
            Ready to modernize your society?
          </h2>
          <p className="text-body-lg md:text-lg leading-relaxed text-white/90 max-w-[56ch] m-0">
            Set up your first tower in an afternoon — no hardware to buy beyond the gate terminal you already
            have.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              to="/register"
              className="h-14 px-8 rounded-xl bg-white text-brand-600 font-extrabold text-body-lg flex items-center justify-center hover:bg-brand-50 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(6,20,45,0.35)] transition-all !no-underline"
            >
              Register your society
            </Link>
            <Link
              to="#contact"
              className="h-14 px-6 rounded-xl border-2 border-white/55 text-white font-bold text-body-lg flex items-center justify-center hover:bg-white/15 transition-colors !no-underline"
            >
              Talk to us
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="contact" className="bg-[#0E1420] pt-14 pb-8 px-5 md:px-10">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-10">
          <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
            <div className="flex flex-col gap-3.5">
              <Link to="/" className="flex items-center gap-2.5 !no-underline">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                  <img src={logo} alt="SmartSociety" className="w-full h-full object-contain p-1" />
                </div>
                <span className="font-heading font-bold text-lg text-white">SmartSociety</span>
              </Link>
              <p className="text-sm leading-relaxed text-white/60 max-w-[36ch] m-0">
                Housing society management for residents, admins and gate security. Built for Green Valley and
                500 societies like it.
              </p>
              <span className="inline-flex items-center gap-2 text-sm text-white/70">
                <span className="w-2 h-2 rounded-full bg-teal-300" />
                All systems operational
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[11px] text-white/45">QUICK LINKS</span>
              <Link to="/" className="text-sm text-white/78 hover:text-white !no-underline transition-colors">Home</Link>
              <Link to="#features" className="text-sm text-white/78 hover:text-white !no-underline transition-colors">Features</Link>
              <Link to="/sitemap" className="text-sm text-white/78 hover:text-white !no-underline transition-colors">Sitemap</Link>
              <Link to="#contact" className="text-sm text-white/78 hover:text-white !no-underline transition-colors">Contact</Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[11px] text-white/45">SOCIETY</span>
              <Link to="/emergency-directory" className="text-sm text-white/78 hover:text-white !no-underline transition-colors">Emergency Contact Directory</Link>
              <Link to="/guidelines" className="text-sm text-white/78 hover:text-white !no-underline transition-colors">Society Guidelines</Link>
              <Link to="#support" className="text-sm text-white/78 hover:text-white !no-underline transition-colors">Support</Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[11px] text-white/45">LEGAL</span>
              <Link to="#privacy" className="text-sm text-white/78 hover:text-white !no-underline transition-colors">Privacy</Link>
              <Link to="#terms" className="text-sm text-white/78 hover:text-white !no-underline transition-colors">Terms</Link>
              <Link to="#audit" className="text-sm text-white/78 hover:text-white !no-underline transition-colors">Audit policy</Link>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-white/45">© 2026 SmartSociety. All rights reserved.</span>
            <div className="flex gap-3.5">
              {[
                { Icon: FaXTwitter, label: "X", href: "#x" },
                { Icon: FaLinkedinIn, label: "LinkedIn", href: "#linkedin" },
                { Icon: FaGithub, label: "GitHub", href: "#github" },
                { Icon: FaInstagram, label: "Instagram", href: "#instagram" },
              ].map(({ Icon, label, href }) => (
                <Link
                  key={label}
                  to={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all !no-underline"
                >
                  <Icon size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
