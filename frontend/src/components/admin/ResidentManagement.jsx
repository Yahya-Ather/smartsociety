import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Badge,
  Button,
  Modal,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  FormField,
  TextInput,
  Select,
} from "../ui/index.js";
import { IconSearch } from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapResidentRow, mapTicket, mapAdminBill } from "../../utils/mappers.js";
import { RESIDENT_STATUS, OCCUPANCY_TYPE, FLAT_STATUS, formatINR } from "../../utils/status.js";
import { useSort } from "../../utils/useSort.js";

const DEFAULT_BLOCKS = ["Tower A", "Tower B", "Tower C"];

const RESIDENT_SORT_RESOLVERS = {
  name: (r) => r.name,
  flat: (r) => r.flat,
  occupancyType: (r) => r.occupancyType,
  phone: (r) => r.phone,
  status: (r) => r.status,
};

export default function ResidentManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [residents, setResidents] = useState([]);
  const [flats, setFlats] = useState([]);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardError, setOnboardError] = useState("");
  const [onboarding, setOnboarding] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailBills, setDetailBills] = useState([]);
  const [detailComplaints, setDetailComplaints] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetCreds, setResetCreds] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyBlock, setVerifyBlock] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [residentsRes, flatsRes] = await Promise.all([
        api.get("/admin/residents"),
        api.get("/admin/flats"),
      ]);
      setResidents(residentsRes.data.data.map(mapResidentRow));
      setFlats(flatsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load residents.");
    } finally {
      setLoading(false);
    }
  }

  const blocks = useMemo(() => [...new Set(flats.map((f) => f.block_name))], [flats]);
  const towerOptions = useMemo(() => [...new Set([...DEFAULT_BLOCKS, ...blocks])], [blocks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return residents.filter((r) => {
      if (blockFilter !== "all" && r.block !== blockFilter) return false;
      if (typeFilter !== "all" && r.occupancyType !== typeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q && !`${r.name} ${r.flat} ${r.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [residents, search, blockFilter, typeFilter, statusFilter]);

  const { sorted, sortKey, sortDir, toggleSort } = useSort(filtered, RESIDENT_SORT_RESOLVERS);

  const owners = residents.filter((r) => r.occupancyType === "owner").length;
  const tenants = residents.filter((r) => r.occupancyType === "tenant").length;

  const occupancyMap = useMemo(() => {
    const map = {};
    for (const f of flats) {
      if (!map[f.block_name]) map[f.block_name] = [];
      const resident = residents.find((r) => r.flatId === f._id);
      let status = "vacant";
      if (resident) status = resident.isActive ? resident.occupancyType : "attention";
      else if (f.is_occupied) status = "attention";
      map[f.block_name].push({ flat: `${f.block_name.replace(/^Tower\s*/i, "")}-${f.flat_number}`, status, residentId: resident?.id });
    }
    return map;
  }, [flats, residents]);

  async function openDetail(r) {
    setDetail(r);
    setEditingUsername(false);
    setUsernameInput(r.username || "");
    setUsernameError("");
    setVerifyBlock(r.block || DEFAULT_BLOCKS[0]);
    setPasswordInput("");
    setPasswordError("");
    try {
      const [billsRes, complaintsRes] = await Promise.all([
        api.get("/admin/billing"),
        api.get(`/admin/helpdesk`),
      ]);
      setDetailBills(billsRes.data.data.filter((b) => b.flat_id?._id === r.flatId).map(mapAdminBill));
      setDetailComplaints(complaintsRes.data.data.filter((c) => c.resident_id?._id === r.id).map(mapTicket));
    } catch {
      setDetailBills([]);
      setDetailComplaints([]);
    }
  }

  async function handleOnboard(e) {
    e.preventDefault();
    setOnboardError("");
    setOnboarding(true);
    try {
      const { data } = await api.post("/admin/resident", {
        name: form.name,
        email: form.email,
        phone_number: form.phone,
        block_name: form.block,
        flat_number: form.flatNumber,
        occupancy_type: form.occupancyType === "owner" ? "Owner" : "Tenant",
      });
      setCreatedCreds({ username: data.data.username, password: data.data.temp_password });
      setOnboardOpen(false);
      setForm(emptyForm());
      await load();
    } catch (err) {
      setOnboardError(err.response?.data?.message || "Failed to onboard resident.");
    } finally {
      setOnboarding(false);
    }
  }

  async function handleSaveUsername() {
    if (!detail || !usernameInput.trim() || usernameInput.trim() === detail.username) {
      setEditingUsername(false);
      return;
    }
    setSavingUsername(true);
    setUsernameError("");
    try {
      const { data } = await api.patch(`/admin/residents/${detail.id}/username`, { username: usernameInput.trim() });
      setDetail((d) => (d ? { ...d, username: data.data.username } : d));
      setEditingUsername(false);
      await load();
    } catch (err) {
      setUsernameError(err.response?.data?.message || "Failed to update username.");
    } finally {
      setSavingUsername(false);
    }
  }

  async function handleGeneratePassword(id) {
    setResettingPassword(true);
    try {
      const { data } = await api.patch(`/admin/residents/${id}/reset-password`);
      setResetCreds({ username: data.data.username, password: data.data.temp_password });
      setPasswordOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setResettingPassword(false);
    }
  }

  async function handleSetPassword() {
    if (!detail) return;
    if (passwordInput.trim().length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    setResettingPassword(true);
    setPasswordError("");
    try {
      const { data } = await api.patch(`/admin/residents/${detail.id}/reset-password`, {
        password: passwordInput.trim(),
      });
      setResetCreds({ username: data.data.username, password: data.data.temp_password });
      setPasswordOpen(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setResettingPassword(false);
    }
  }

  async function handleOffboard(id) {
    try {
      await api.patch(`/admin/residents/${id}/offboard`);
      setDetail(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to offboard resident.");
    }
  }

  async function handleVerify() {
    if (!detail) return;
    setVerifying(true);
    try {
      await api.patch(`/admin/residents/${detail.id}/verify`, { block_name: verifyBlock });
      await load();
      setDetail((d) => (d ? { ...d, status: "active", isActive: true, block: verifyBlock } : d));
      setVerifyOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify resident.");
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading residents…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1440px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Resident Management</h1>
          <span className="text-body text-slate-500">
            {residents.length} residents · {owners} owners · {tenants} tenants
          </span>
        </div>
        <Button size="sm" onClick={() => setOnboardOpen(true)}>+ Onboard Resident</Button>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      {/* View toggle + filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            onClick={() => setView("list")}
            className={`h-9 px-4 rounded-control text-body font-semibold transition-colors ${view === "list" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
          >
            List View
          </button>
          <button
            onClick={() => setView("map")}
            className={`h-9 px-4 rounded-control text-body font-semibold transition-colors ${view === "map" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
          >
            Occupancy Map View
          </button>
        </div>

        {view === "list" && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 w-full sm:w-[260px] h-10 px-3 border border-slate-300 rounded-lg bg-white">
              <IconSearch />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, flat number or phone"
                className="flex-1 min-w-0 outline-none text-body placeholder:text-slate-400"
              />
            </div>
            <Select value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} className="!w-[140px] !h-10">
              <option value="all">All blocks</option>
              {blocks.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="!w-[130px] !h-10">
              <option value="all">All types</option>
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="!w-[140px] !h-10">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="kyc-pending">Awaiting verification</option>
            </Select>
          </div>
        )}
      </div>

      {view === "list" ? (
        <Card padded={false}>
          <Table minWidth="760px">
            <Thead>
              <Th sortKey="name" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Resident name</Th>
              <Th sortKey="flat" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Flat</Th>
              <Th sortKey="occupancyType" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Occupancy</Th>
              <Th sortKey="phone" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Phone</Th>
              <Th sortKey="status" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Status</Th>
              <Th align="right">Actions</Th>
            </Thead>
            <tbody>
              {sorted.map((r) => {
                const status = RESIDENT_STATUS[r.status];
                const type = OCCUPANCY_TYPE[r.occupancyType];
                return (
                  <Tr key={r.id} className="cursor-pointer" onClick={() => openDetail(r)}>
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs flex-shrink-0 ${type.tone === "info" ? "bg-brand-100 text-brand-600" : "bg-teal-100 text-teal-700"}`}>
                          {initialsOf(r.name)}
                        </span>
                        <span className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-bold truncate">{r.name}</span>
                          <span className="text-xs text-slate-400 truncate">{r.email}</span>
                        </span>
                      </span>
                    </Td>
                    <Td mono>{r.flat}</Td>
                    <Td><Badge tone={type.tone}>{type.label}</Badge></Td>
                    <Td className="font-mono text-mono-amt text-slate-500">{r.phone}</Td>
                    <Td><Badge tone={status.tone}>{status.label}</Badge></Td>
                    <Td align="right">
                      <button
                        onClick={(e) => { e.stopPropagation(); openDetail(r); }}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        View profile
                      </button>
                    </Td>
                  </Tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-body text-slate-400">No residents match these filters.</td>
                </tr>
              )}
            </tbody>
          </Table>
          <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
            Showing {filtered.length} of {residents.length} residents
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-wrap items-center gap-5">
            <span className="text-label uppercase text-slate-400">Legend</span>
            {["owner", "tenant", "vacant", "attention"].map((key) => {
              const s = FLAT_STATUS[key];
              return (
                <span key={key} className="inline-flex items-center gap-2 text-body">
                  <TileSwatch status={key} />
                  {s.label}
                </span>
              );
            })}
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(occupancyMap).map(([tower, tiles]) => {
              const occupied = tiles.filter((t) => t.status === "owner" || t.status === "tenant").length;
              return (
                <Card key={tower} className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-heading font-semibold text-h3 m-0">{tower}</h3>
                    <span className="font-mono text-xs text-slate-500">{occupied}/{tiles.length} OCCUPIED</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {tiles.map((tile) => (
                      <button
                        key={tile.flat}
                        disabled={!tile.residentId}
                        onClick={() => {
                          const r = residents.find((res) => res.id === tile.residentId);
                          if (r) openDetail(r);
                        }}
                        title={tile.flat}
                        className={`aspect-square rounded-md ${tile.residentId ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <TileSwatch status={tile.status} full />
                      </button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Onboard modal */}
      <Modal
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        title="Onboard resident"
        subtitle="Creates the account and links it to a flat immediately."
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOnboardOpen(false)}>Cancel</Button>
            <Button onClick={handleOnboard} disabled={onboarding}>
              {onboarding ? "Creating…" : "Create Account"}
            </Button>
          </>
        }
      >
        <FormField label="Full name" required>
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kavya Rao" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email" required>
            <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" />
          </FormField>
          <FormField label="Phone">
            <TextInput className="font-mono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="70210 88431" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Block" required>
            <TextInput value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} placeholder="Tower B" />
          </FormField>
          <FormField label="Flat number" required>
            <TextInput className="font-mono" value={form.flatNumber} onChange={(e) => setForm({ ...form, flatNumber: e.target.value })} placeholder="0201" />
          </FormField>
        </div>
        <FormField label="Occupancy type">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            {["owner", "tenant"].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setForm({ ...form, occupancyType: t })}
                className={`h-9 rounded-control text-body font-semibold capitalize ${form.occupancyType === t ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </FormField>
        {onboardError && <span className="text-xs font-semibold text-danger-fg">{onboardError}</span>}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-brand-100">
          <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
          <span className="text-xs text-brand-700 leading-relaxed">
            The account is activated immediately with a generated temporary password shown after creation.
          </span>
        </div>
      </Modal>

      {/* Credentials modal */}
      <Modal
        open={!!createdCreds}
        onClose={() => setCreatedCreds(null)}
        title="Resident account created"
        subtitle="Share these credentials with the resident."
        maxWidth="380px"
        footer={<Button onClick={() => setCreatedCreds(null)}>Done</Button>}
      >
        {createdCreds && (
          <div className="p-4 rounded-lg bg-slate-50 flex flex-col gap-2 font-mono">
            <span>Username: <strong>{createdCreds.username}</strong></span>
            <span>Temp password: <strong>{createdCreds.password}</strong></span>
          </div>
        )}
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} maxWidth="440px">
        {detail && (
          <>
            <div className="flex items-start justify-between gap-3 -mt-1 mb-1">
              <div className="flex items-center gap-3.5">
                <div className="w-[52px] h-[52px] rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-heading font-bold text-lg flex-shrink-0">
                  {initialsOf(detail.name)}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-heading font-bold text-h3">{detail.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge tone={OCCUPANCY_TYPE[detail.occupancyType].tone}>{OCCUPANCY_TYPE[detail.occupancyType].label}</Badge>
                    <Badge tone={RESIDENT_STATUS[detail.status].tone}>{RESIDENT_STATUS[detail.status].label}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-slate-50">
              <DetailRow label="Flat" value={`${detail.flat} · ${detail.block}`} mono />
              <DetailRow label="Phone" value={detail.phone} mono />
              <DetailRow label="Email" value={detail.email} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 border border-slate-200 rounded-lg flex flex-col gap-1.5">
                <span className="text-label uppercase text-slate-500">Outstanding dues</span>
                <span className={`font-heading font-extrabold text-xl ${detailBills.some((b) => b.status !== "paid") ? "text-danger-fg" : "text-slate-800"}`}>
                  {formatINR(detailBills.filter((b) => b.status !== "paid").reduce((sum, b) => sum + b.amount, 0))}
                </span>
                <span className="text-xs text-slate-500">{detailBills.length} bills on record</span>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-lg flex flex-col gap-1.5">
                <span className="text-label uppercase text-slate-500">Complaints</span>
                <span className="font-heading font-extrabold text-xl text-slate-800">{detailComplaints.filter((c) => c.status !== "resolved").length}</span>
                <span className="text-xs text-slate-500">open · {detailComplaints.filter((c) => c.status === "resolved").length} resolved</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 p-3.5 border border-slate-200 rounded-lg">
              <span className="text-label uppercase text-slate-500">Account</span>
              {editingUsername ? (
                <div className="flex flex-col gap-2">
                  <TextInput
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    autoFocus
                  />
                  {usernameError && <span className="text-xs font-semibold text-danger-fg">{usernameError}</span>}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveUsername} disabled={savingUsername}>
                      {savingUsername ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => { setEditingUsername(false); setUsernameInput(detail.username || ""); setUsernameError(""); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-body font-semibold">@{detail.username}</span>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Edit username
                  </button>
                </div>
              )}
              <button
                onClick={() => setPasswordOpen(true)}
                className="text-xs font-semibold text-left text-brand-600 hover:text-brand-700"
              >
                Change password
              </button>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              {!detail.isActive && (
                <Button className="w-full" onClick={() => setVerifyOpen(true)}>Verify &amp; activate</Button>
              )}
              {detail.isActive && (
                <Button variant="danger" className="w-full" onClick={() => handleOffboard(detail.id)}>
                  Offboard Resident
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Verify & assign tower modal */}
      <Modal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        title="Verify & activate"
        subtitle="Self-registration doesn't collect a tower — confirm it against the resident's KYC documents before activating."
        maxWidth="380px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setVerifyOpen(false)}>Cancel</Button>
            <Button onClick={handleVerify} disabled={verifying}>
              {verifying ? "Activating…" : "Activate resident"}
            </Button>
          </>
        }
      >
        {detail && (
          <>
            <FormField label="Tower / block" required>
              <Select value={verifyBlock} onChange={(e) => setVerifyBlock(e.target.value)}>
                {towerOptions.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
            </FormField>
            <span className="text-xs text-slate-500">Flat {detail.flat?.split("-").pop() || detail.flat} will be moved under this tower.</span>
          </>
        )}
      </Modal>

      {/* Change password modal */}
      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change password"
        subtitle="Set a specific password, or generate a random one."
        maxWidth="380px"
        footer={
          <>
            <Button variant="secondary" onClick={() => detail && handleGeneratePassword(detail.id)} disabled={resettingPassword}>
              Generate random
            </Button>
            <Button onClick={handleSetPassword} disabled={resettingPassword}>
              {resettingPassword ? "Saving…" : "Set password"}
            </Button>
          </>
        }
      >
        <FormField label="New password" error={passwordError} helper="At least 6 characters.">
          <TextInput
            type="text"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            error={Boolean(passwordError)}
            placeholder="Enter a new password"
            autoFocus
          />
        </FormField>
      </Modal>

      {/* Password confirmation modal */}
      <Modal
        open={!!resetCreds}
        onClose={() => setResetCreds(null)}
        title="Password updated"
        subtitle="Share these credentials with the resident."
        maxWidth="380px"
        footer={<Button onClick={() => setResetCreds(null)}>Done</Button>}
      >
        {resetCreds && (
          <div className="p-4 rounded-lg bg-slate-50 flex flex-col gap-2 font-mono">
            <span>Username: <strong>{resetCreds.username}</strong></span>
            <span>Password: <strong>{resetCreds.password}</strong></span>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-body text-slate-500">{label}</span>
      <span className={`text-body font-semibold ${mono ? "font-mono text-mono-amt" : ""}`}>{value}</span>
    </div>
  );
}

function TileSwatch({ status, full }) {
  const styles = {
    owner: "bg-brand-100 border border-brand-500 text-brand-600",
    tenant: "bg-teal-100 border border-teal-500 text-teal-700",
    vacant: "bg-white border border-dashed border-slate-300 text-slate-400",
    attention: "bg-warning-bg border border-warning-fg text-warning-fg",
  };
  const letter = { owner: "O", tenant: "T", vacant: "V", attention: "!" }[status];
  return (
    <span className={`flex items-center justify-center rounded-md font-heading font-bold text-[11px] ${styles[status]} ${full ? "w-full h-full" : "w-[22px] h-[22px]"}`}>
      {letter}
    </span>
  );
}

function initialsOf(name) {
  return (name || "").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function emptyForm() {
  return {
    name: "",
    email: "",
    phone: "",
    block: "Tower B",
    flatNumber: "",
    occupancyType: "owner",
  };
}
