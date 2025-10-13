import React, { useEffect, useState } from "react";

export default function ClockBox({ small = false }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const display = time.toLocaleTimeString();
    return (
        <div className={small ? "text-muted small" : "text-end text-muted small mb-2"}>
            <span role="img" aria-label="clock">🕒</span> {display} <span className="text-muted">({tz})</span>
        </div>
    );
}
