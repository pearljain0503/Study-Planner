import React from "react";

export default function SessionCard({ session, onStart, onEdit, onDelete }) {
    return (
        <div className="card shadow-sm mb-3 h-100">
            <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between mb-2">
                    <h6 className="card-title mb-0">{session.subject}</h6>
                    <small className="text-muted">{new Date(session.start).toLocaleString()}</small>
                </div>

                <p className="mb-1"><strong>{session.topic}</strong></p>
                <div className="mb-2">
                    <span className="badge bg-info me-2">{session.duration}m</span>
                    <span className={`badge ${session.priority === "High" ? "bg-danger" : "bg-secondary"} me-2`}>{session.priority}</span>
                    {session.tags?.slice(0, 3).map((t, i) => <span className="badge bg-light text-dark me-1" key={i}>#{t}</span>)}
                </div>

                {session.summary && <p className="text-muted small mb-2">{session.summary}</p>}
                {session.notes && <p className="small mb-2"><strong>Note:</strong> {session.notes}</p>}

                <div className="mt-auto d-flex justify-content-between">
                    <div>
                        <button className="btn btn-sm btn-success me-2" onClick={() => onStart(session)}>Start</button>
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onEdit(session)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(session.id)}>Delete</button>
                    </div>
                    <div>
                        {session.status === "done"
                            ? <span className="badge bg-success">Done</span>
                            : <span className="badge bg-warning text-dark">Planned</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
