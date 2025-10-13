import React, { useEffect, useState } from "react";

export default function PomodoroTimer({ session, onClose, onComplete }) {
    const initial = session.duration * 60;
    const [seconds, setSeconds] = useState(initial);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        setSeconds(session.duration * 60);
        setRunning(false);
    }, [session]);

    useEffect(() => {
        let t;
        if (running && seconds > 0) t = setTimeout(() => setSeconds(s => s - 1), 1000);
        if (running && seconds === 0) {
            onComplete(session.id);
            onClose();
        }
        return () => clearTimeout(t);
    }, [running, seconds, session, onComplete, onClose]);

    const minutes = Math.floor(seconds / 60);
    const rem = (seconds % 60).toString().padStart(2, "0");

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content p-3 text-center">
                    <div className="modal-header border-0">
                        <h5 className="modal-title">{session.subject} • {session.topic}</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <div style={{ fontSize: "3rem", margin: "1rem 0" }}>{minutes}:{rem}</div>
                    <div className="mb-2">
                        <button className="btn btn-success me-2" onClick={() => setRunning(true)}>Start</button>
                        <button className="btn btn-warning me-2" onClick={() => setRunning(false)}>Pause</button>
                        <button className="btn btn-secondary me-2" onClick={() => { setRunning(false); setSeconds(initial); }}>Reset</button>
                        <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
                    </div>
                    <div className="small text-muted">When timer finishes the session will be automatically marked done.</div>
                </div>
            </div>
        </div>
    );
}
