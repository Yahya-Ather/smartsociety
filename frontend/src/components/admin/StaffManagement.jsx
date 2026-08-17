import { useEffect, useMemo, useState } from "react";
import { Card, Badge, Button, Modal, Table, Thead, Th, Tr, Td, FormField, TextInput, Select } from "../ui/index.js";
import { IconSearch } from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapStaffRow, mapServiceStaffRow } from "../../utils/mappers.js";
import { STAFF_STATUS, STAFF_ROLE, SERVICE_TYPE_TONE } from "../../utils/status.js";
import { useSort } from "../../utils/useSort.js";

const STAFF_SORT_RESOLVERS = {
  name: (s) => s.name,
  role: (s) => s.role,
  email: (s) => s.email,
  gate: (s) => s.gate,
  status: (s) => s.status,
};

const SERVICE_SORT_RESOLVERS = {
  name: (s) => s.name,
  serviceType: (s) => s.serviceType,
  phone: (s) => s.phone,
  status: (s) => s.status,
};

const SERVICE_TYPES = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Housekeeping",
  "Facility Manager",
  "Gardener",
  "Painter",
  "Pest Control",
  "Other",
];

export default function StaffManagement() {
  const [view, setView] = useState("portal"); // "portal" | "service"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staff, setStaff] = useState([]);
  const [serviceStaff, setServiceStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [addedNotice, setAddedNotice] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [serviceForm, setServiceForm] = useState(emptyServiceForm());

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [staffRes, serviceRes] = await Promise.all([
        api.get("/admin/staff"),
        api.get("/admin/service-staff"),
      ]);
      setStaff(staffRes.data.data.map(mapStaffRow));
      setServiceStaff(serviceRes.data.data.map(mapServiceStaffRow));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  }

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter((s) => {
      if (roleFilter !== "all" && s.role !== roleFilter) return false;
      if (q && !`${s.name} ${s.email} ${s.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [staff, search, roleFilter]);

  const filteredServiceStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return serviceStaff.filter((s) => {
      if (roleFilter !== "all" && s.serviceType !== roleFilter) return false;
      if (q && !`${s.name} ${s.phone} ${s.serviceType}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [serviceStaff, search, roleFilter]);

  const staffSort = useSort(filteredStaff, STAFF_SORT_RESOLVERS);
  const serviceSort = useSort(filteredServiceStaff, SERVICE_SORT_RESOLVERS);

  const admins = staff.filter((s) => s.role === "Admin").length;
  const guards = staff.filter((s) => s.role === "Guard").length;
  const active = staff.filter((s) => s.isActive).length;
  const serviceActive = serviceStaff.filter((s) => s.isActive).length;
  const serviceTypeCounts = useMemo(() => {
    const counts = {};
    serviceStaff.forEach((s) => {
      counts[s.serviceType] = (counts[s.serviceType] || 0) + 1;
    });
    return counts;
  }, [serviceStaff]);

  function switchView(v) {
    setView(v);
    setRoleFilter("all");
    setSearch("");
  }

  async function handleAdd(e) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const { data } = await api.post("/admin/staff", {
        name: form.name,
        email: form.email,
        phone_number: form.phone,
        role: form.role,
        gate: form.role === "Guard" ? form.gate : undefined,
      });
      setCreatedCreds({ username: data.data.username, password: data.data.temp_password, role: data.data.role });
      setAddOpen(false);
      setForm(emptyForm());
      await load();
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to create staff account.");
    } finally {
      setAdding(false);
    }
  }

  async function handleAddService(e) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      await api.post("/admin/service-staff", {
        name: serviceForm.name,
        phone_number: serviceForm.phone,
        service_type: serviceForm.serviceType,
      });
      setAddedNotice(`${serviceForm.name} (${serviceForm.serviceType}) added to the directory.`);
      setAddOpen(false);
      setServiceForm(emptyServiceForm());
      await load();
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add service staff.");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleActive(s) {
    setError("");
    try {
      await api.patch(`/admin/staff/${s.id}/${s.isActive ? "deactivate" : "reactivate"}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update staff status.");
    }
  }

  async function handleToggleServiceActive(s) {
    setError("");
    try {
      await api.patch(`/admin/service-staff/${s.id}/${s.isActive ? "deactivate" : "reactivate"}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update service staff status.");
    }
  }

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading staff…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1440px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Staff Management</h1>
          <span className="text-body text-slate-500">
            {staff.length} portal staff · {serviceStaff.length} service staff
          </span>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          {view === "portal" ? "+ Add Staff" : "+ Add Service Staff"}
        </Button>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      {/* View toggle */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => switchView("portal")}
          className={`h-9 px-4 rounded-control text-body font-semibold transition-colors ${view === "portal" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
        >
          Portal Staff
        </button>
        <button
          onClick={() => switchView("service")}
          className={`h-9 px-4 rounded-control text-body font-semibold transition-colors ${view === "service" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
        >
          Service Staff
        </button>
      </div>

      {view === "portal" ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Card className="flex flex-col gap-1.5">
              <span className="text-label uppercase text-slate-500">Total staff</span>
              <span className="font-heading font-extrabold text-2xl text-slate-800">{staff.length}</span>
            </Card>
            <Card className="flex flex-col gap-1.5">
              <span className="text-label uppercase text-slate-500">Active</span>
              <span className="font-heading font-extrabold text-2xl text-success-fg">{active}</span>
            </Card>
            <Card className="flex flex-col gap-1.5">
              <span className="text-label uppercase text-slate-500">Admins</span>
              <span className="font-heading font-extrabold text-2xl text-brand-600">{admins}</span>
            </Card>
            <Card className="flex flex-col gap-1.5">
              <span className="text-label uppercase text-slate-500">Guards</span>
              <span className="font-heading font-extrabold text-2xl text-teal-700">{guards}</span>
            </Card>
          </div>

          {/* Filter bar */}
          <Card className="flex flex-wrap items-center justify-between gap-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 w-full sm:w-[260px] h-10 px-3 border border-slate-300 rounded-lg bg-white">
                <IconSearch />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, email or phone"
                  className="flex-1 min-w-0 outline-none text-body placeholder:text-slate-400"
                />
              </div>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="!w-[130px] !h-10">
                <option value="all">All roles</option>
                <option value="Admin">Admin</option>
                <option value="Guard">Guard</option>
              </Select>
            </div>
            <span className="text-xs text-slate-400">{filteredStaff.length} staff</span>
          </Card>

          <Card padded={false}>
            <Table minWidth="760px">
              <Thead>
                <Th sortKey="name" activeKey={staffSort.sortKey} direction={staffSort.sortDir} onSort={staffSort.toggleSort}>Name</Th>
                <Th sortKey="role" activeKey={staffSort.sortKey} direction={staffSort.sortDir} onSort={staffSort.toggleSort}>Role</Th>
                <Th sortKey="email" activeKey={staffSort.sortKey} direction={staffSort.sortDir} onSort={staffSort.toggleSort}>Contact</Th>
                <Th sortKey="gate" activeKey={staffSort.sortKey} direction={staffSort.sortDir} onSort={staffSort.toggleSort}>Gate</Th>
                <Th sortKey="status" activeKey={staffSort.sortKey} direction={staffSort.sortDir} onSort={staffSort.toggleSort}>Status</Th>
                <Th align="right">Actions</Th>
              </Thead>
              <tbody>
                {staffSort.sorted.map((s) => {
                  const role = STAFF_ROLE[s.role];
                  const status = STAFF_STATUS[s.status];
                  return (
                    <Tr key={s.id}>
                      <Td>
                        <span className="flex items-center gap-2.5">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs flex-shrink-0 ${role.tone === "info" ? "bg-brand-100 text-brand-600" : "bg-teal-100 text-teal-700"}`}>
                            {initialsOf(s.name)}
                          </span>
                          <span className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-bold truncate">{s.name}</span>
                            <span className="text-xs text-slate-400 truncate">@{s.username}</span>
                          </span>
                        </span>
                      </Td>
                      <Td><Badge tone={role.tone}>{role.label}</Badge></Td>
                      <Td>
                        <span className="flex flex-col gap-0.5">
                          <span className="text-body">{s.email}</span>
                          <span className="text-xs text-slate-400 font-mono">{s.phone}</span>
                        </span>
                      </Td>
                      <Td className="text-body text-slate-500">{s.gate || "—"}</Td>
                      <Td><Badge tone={status.tone}>{status.label}</Badge></Td>
                      <Td align="right">
                        <button
                          onClick={() => handleToggleActive(s)}
                          className={`text-xs font-semibold ${s.isActive ? "text-danger-fg hover:text-danger-hover" : "text-success-fg hover:text-success-fg"}`}
                        >
                          {s.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                      </Td>
                    </Tr>
                  );
                })}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-body text-slate-400">No staff match these filters.</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
              Showing {filteredStaff.length} of {staff.length} staff
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Card className="flex flex-col gap-1.5">
              <span className="text-label uppercase text-slate-500">Total service staff</span>
              <span className="font-heading font-extrabold text-2xl text-slate-800">{serviceStaff.length}</span>
            </Card>
            <Card className="flex flex-col gap-1.5">
              <span className="text-label uppercase text-slate-500">Active</span>
              <span className="font-heading font-extrabold text-2xl text-success-fg">{serviceActive}</span>
            </Card>
            <Card className="flex flex-col gap-1.5 col-span-2">
              <span className="text-label uppercase text-slate-500">By type</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(serviceTypeCounts).length === 0 && <span className="text-xs text-slate-400">No service staff yet.</span>}
                {Object.entries(serviceTypeCounts).map(([type, count]) => (
                  <Badge key={type} tone={SERVICE_TYPE_TONE[type] || "neutral"}>{type} · {count}</Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Filter bar */}
          <Card className="flex flex-wrap items-center justify-between gap-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 w-full sm:w-[260px] h-10 px-3 border border-slate-300 rounded-lg bg-white">
                <IconSearch />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, phone or type"
                  className="flex-1 min-w-0 outline-none text-body placeholder:text-slate-400"
                />
              </div>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="!w-[170px] !h-10">
                <option value="all">All types</option>
                {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <span className="text-xs text-slate-400">{filteredServiceStaff.length} staff</span>
          </Card>

          <Card padded={false}>
            <Table minWidth="620px">
              <Thead>
                <Th sortKey="name" activeKey={serviceSort.sortKey} direction={serviceSort.sortDir} onSort={serviceSort.toggleSort}>Name</Th>
                <Th sortKey="serviceType" activeKey={serviceSort.sortKey} direction={serviceSort.sortDir} onSort={serviceSort.toggleSort}>Service type</Th>
                <Th sortKey="phone" activeKey={serviceSort.sortKey} direction={serviceSort.sortDir} onSort={serviceSort.toggleSort}>Phone</Th>
                <Th sortKey="status" activeKey={serviceSort.sortKey} direction={serviceSort.sortDir} onSort={serviceSort.toggleSort}>Status</Th>
                <Th align="right">Actions</Th>
              </Thead>
              <tbody>
                {serviceSort.sorted.map((s) => {
                  const status = STAFF_STATUS[s.status];
                  return (
                    <Tr key={s.id}>
                      <Td>
                        <span className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs flex-shrink-0 bg-slate-100 text-slate-600">
                            {initialsOf(s.name)}
                          </span>
                          <span className="font-bold">{s.name}</span>
                        </span>
                      </Td>
                      <Td><Badge tone={SERVICE_TYPE_TONE[s.serviceType] || "neutral"}>{s.serviceType}</Badge></Td>
                      <Td className="font-mono text-mono-amt text-slate-500">{s.phone}</Td>
                      <Td><Badge tone={status.tone}>{status.label}</Badge></Td>
                      <Td align="right">
                        <button
                          onClick={() => handleToggleServiceActive(s)}
                          className={`text-xs font-semibold ${s.isActive ? "text-danger-fg hover:text-danger-hover" : "text-success-fg hover:text-success-fg"}`}
                        >
                          {s.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                      </Td>
                    </Tr>
                  );
                })}
                {filteredServiceStaff.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-body text-slate-400">No service staff match these filters.</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
              Showing {filteredServiceStaff.length} of {serviceStaff.length} service staff
            </div>
          </Card>
        </>
      )}

      {/* Add portal staff modal */}
      <Modal
        open={addOpen && view === "portal"}
        onClose={() => setAddOpen(false)}
        title="Add staff account"
        subtitle="Creates the account immediately with a temporary password."
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? "Creating…" : "Create Account"}
            </Button>
          </>
        }
      >
        <FormField label="Role">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            {["Admin", "Guard"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setForm({ ...form, role: r })}
                className={`h-9 rounded-control text-body font-semibold ${form.role === r ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="Full name" required>
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ravi Kumar" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email" required>
            <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" />
          </FormField>
          <FormField label="Phone">
            <TextInput className="font-mono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98204 41207" />
          </FormField>
        </div>
        {form.role === "Guard" && (
          <FormField label="Gate assignment">
            <TextInput value={form.gate} onChange={(e) => setForm({ ...form, gate: e.target.value })} placeholder="Gate 1 - Service Entrance" />
          </FormField>
        )}
        {addError && <span className="text-xs font-semibold text-danger-fg">{addError}</span>}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-brand-100">
          <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
          <span className="text-xs text-brand-700 leading-relaxed">
            The account is activated immediately with a generated temporary password shown after creation.
          </span>
        </div>
      </Modal>

      {/* Add service staff modal */}
      <Modal
        open={addOpen && view === "service"}
        onClose={() => setAddOpen(false)}
        title="Add service staff"
        subtitle="Adds to the directory — no portal login is created."
        maxWidth="440px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddService} disabled={adding}>
              {adding ? "Adding…" : "Add to Directory"}
            </Button>
          </>
        }
      >
        <FormField label="Service type">
          <Select value={serviceForm.serviceType} onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}>
            {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormField>
        <FormField label="Full name" required>
          <TextInput value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="Iqbal Hussain" />
        </FormField>
        <FormField label="Phone" required>
          <TextInput className="font-mono" value={serviceForm.phone} onChange={(e) => setServiceForm({ ...serviceForm, phone: e.target.value })} placeholder="0300-1234567" />
        </FormField>
        {addError && <span className="text-xs font-semibold text-danger-fg">{addError}</span>}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-brand-100">
          <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
          <span className="text-xs text-brand-700 leading-relaxed">
            Service staff don't log into the portal — this just keeps them in the Emergency Contact Directory and roster.
          </span>
        </div>
      </Modal>

      {/* Credentials modal (portal staff only) */}
      <Modal
        open={!!createdCreds}
        onClose={() => setCreatedCreds(null)}
        title={createdCreds ? `${createdCreds.role} account created` : ""}
        subtitle="Share these credentials with the staff member."
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

      {/* Added notice (service staff only) */}
      <Modal
        open={!!addedNotice}
        onClose={() => setAddedNotice(null)}
        title="Added to directory"
        maxWidth="380px"
        footer={<Button onClick={() => setAddedNotice(null)}>Done</Button>}
      >
        {addedNotice && <span className="text-body text-slate-700">{addedNotice}</span>}
      </Modal>
    </div>
  );
}

function initialsOf(name) {
  return (name || "").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function emptyForm() {
  return { role: "Guard", name: "", email: "", phone: "", gate: "" };
}

function emptyServiceForm() {
  return { serviceType: "Plumber", name: "", phone: "" };
}
