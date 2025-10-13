import React, { useEffect, useState } from "react";
import { getData, setData } from "../utils/storageUtils";
import SessionCard from "../components/SessionCard";
import PomodoroTimer from "../components/PomodoroTimer";
import ClockBox from "../components/ClockBox";

const STORAGE_KEY = "sf_sessions_user1";

/* UTILS */
const uid = () => Date.now() + Math.floor(Math.random() * 1000);
const formatToInput = iso => {
    const dt = new Date(iso);
    const pad = n => n.toString().padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

export default function Planner() {
    const [sessions, setSessionsState] = useState(getData(STORAGE_KEY));
    const [selectedSession, setSelectedSession] = useState(null);

    // add/edit modal state
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        subject: "", topic: "", duration: 25, start: new Date().toISOString(),
        priority: "Normal", tags: "", notes: ""
    });
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("start");

    useEffect(() => setSessionsState(getData(STORAGE_KEY)), []);

    const saveSessions = arr => {
        setSessionsState(arr);
        setData(STORAGE_KEY, arr);
    };

    // open add modal, prefill start with client time
    const openAdd = (prefill = {}) => {
        setEditing(null);
        setForm({
            subject: prefill.subject || "",
            topic: prefill.topic || "",
            duration: prefill.duration || 25,
            start: new Date().toISOString(),
            priority: prefill.priority || "Normal",
            tags: prefill.tags || "",
            notes: prefill.notes || ""
        });
        setShowModal(true);
    };

    // edit
    const openEdit = (session) => {
        setEditing(session.id);
        setForm({
            subject: session.subject,
            topic: session.topic,
            duration: session.duration,
            start: session.start,
            priority: session.priority || "Normal",
            tags: (session.tags || []).join(", "),
            notes: session.notes || ""
        });
        setShowModal(true);
    };

    // fetch wikipedia summary (with basic fallback to search)
    const fetchWikiSummary = async (topic) => {
        if (!topic) return "";
        const safe = encodeURIComponent(topic);
        try {
            const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${safe}`);
            if (r.ok) {
                const d = await r.json();
                return d.extract || "";
            }
            // fallback: use opensearch to find a page
            const s = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${safe}&limit=1&origin=*`);
            const ss = await s.json();
            const title = ss[1] && ss[1][0];
            if (title) {
                const r2 = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
                if (r2.ok) {
                    const d2 = await r2.json();
                    return d2.extract || "";
                }
            }
            return "";
        } catch {
            return "";
        }
    };

    const handleAddOrEdit = async (e) => {
        e.preventDefault();
        if (!form.subject.trim() || !form.topic.trim()) return alert("Subject and topic required.");
        setLoadingAdd(true);

        const summary = await fetchWikiSummary(form.topic.trim());

        const obj = {
            id: editing || uid(),
            subject: form.subject.trim(),
            topic: form.topic.trim(),
            duration: Number(form.duration),
            start: new Date(form.start).toISOString(),
            priority: form.priority,
            tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
            notes: form.notes,
            summary: summary,
            status: editing ? (sessions.find(s => s.id === editing)?.status || "planned") : "planned"
        };

        const updated = editing ? sessions.map(s => s.id === editing ? obj : s) : [...sessions, obj];
        saveSessions(updated);
        setShowModal(false);
        setEditing(null);
        setLoadingAdd(false);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Delete this session?")) return;
        saveSessions(sessions.filter(s => s.id !== id));
    };

    const handleStart = (session) => setSelectedSession(session);

    const handleComplete = (id) => {
        saveSessions(sessions.map(s => s.id === id ? { ...s, status: "done", completedAt: new Date().toISOString() } : s));
    };

    const handleExport = () => {
        const data = JSON.stringify(sessions, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "studyflow_sessions.json"; a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (file) => {
        const fr = new FileReader();
        fr.onload = () => {
            try {
                const imported = JSON.parse(fr.result);
                if (!Array.isArray(imported)) throw new Error("Invalid file");
                saveSessions([...sessions, ...imported.map(it => ({ ...it, id: uid() }))]);
                alert("Imported");
            } catch {
                alert("Invalid JSON file");
            }
        };
        fr.readAsText(file);
    };

    // filters & sort
    const filtered = sessions.filter(s => {
        if (filter === "all") return true;
        if (filter === "today") return new Date(s.start).toDateString() === new Date().toDateString();
        if (filter === "done") return s.status === "done";
        return true;
    }).filter(s => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return s.subject.toLowerCase().includes(q) || s.topic.toLowerCase().includes(q) || (s.tags || []).join(" ").toLowerCase().includes(q);
    }).sort((a, b) => {
        if (sortBy === "start") return new Date(a.start) - new Date(b.start);
        if (sortBy === "duration") return b.duration - a.duration;
        if (sortBy === "priority") return (b.priority === "High") - (a.priority === "High");
        return 0;
    });

    return (
        <div>
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h3 className="mb-0">Study Sessions Planner</h3>
                    <small className="text-muted">Plan, focus and track study sessions</small>
                </div>
                <div className="text-end">
                    <ClockBox small />
                    <div className="mt-2">
                        <button className="btn btn-primary me-2" onClick={() => openAdd()}>➕ New Session</button>
                        <button className="btn btn-outline-secondary me-2" onClick={handleExport}>Export</button>
                        <label className="btn btn-outline-secondary mb-0">
                            Import <input type="file" accept=".json" hidden onChange={(e) => e.target.files[0] && handleImport(e.target.files[0])} />
                        </label>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="row mb-3 g-2">
                <div className="col-md-3">
                    <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="today">Today</option>
                        <option value="done">Done</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="start">Sort by start</option>
                        <option value="duration">Sort by duration</option>
                        <option value="priority">Sort by priority</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <input className="form-control" placeholder="Search subject/topic/tags..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="col-md-2 text-end">
                    <button className="btn btn-outline-danger" onClick={() => { if (window.confirm("Clear all sessions?")) { saveSessions([]); } }}>Clear All</button>
                </div>
            </div>

            {/* Cards */}
            <div className="row">
                {filtered.length === 0 && <div className="col-12"><div className="alert alert-light">No sessions found.</div></div>}
                {filtered.map(s => (
                    <div key={s.id} className="col-md-4">
                        <SessionCard session={s} onStart={handleStart} onEdit={openEdit} onDelete={handleDelete} />
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <form className="modal-content" onSubmit={handleAddOrEdit}>
                            <div className="modal-header">
                                <h5 className="modal-title">{editing ? "Edit Session" : "Add Session"}</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditing(null); }}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <label className="form-label">Subject</label>
                                        <input className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Topic</label>
                                        <input className="form-control" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} />
                                        <div className="form-text">A short Wikipedia summary will be fetched automatically.</div>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">Duration (mins)</label>
                                        <input type="number" min="1" className="form-control" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Priority</label>
                                        <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                            <option>Normal</option>
                                            <option>High</option>
                                            <option>Low</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Start (local)</label>
                                        <input type="datetime-local" className="form-control" value={formatToInput(form.start)} onChange={e => {
                                            setForm({ ...form, start: new Date(e.target.value).toISOString() });
                                        }} />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">Tags (comma separated)</label>
                                        <input className="form-control" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">Notes</label>
                                        <textarea className="form-control" rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditing(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loadingAdd}>{loadingAdd ? "Saving..." : (editing ? "Save Changes" : "Add Session")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {selectedSession && <PomodoroTimer session={selectedSession} onClose={() => setSelectedSession(null)} onComplete={handleComplete} />}
        </div>
    );
}
