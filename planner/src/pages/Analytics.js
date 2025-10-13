import React from "react";
import { getData } from "../utils/storageUtils";
import { Bar, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
    const sessions = getData("sf_sessions_user1");
    // hours per subject
    const bySub = {};
    sessions.forEach(s => {
        const h = (s.duration || 0) / 60;
        bySub[s.subject] = (bySub[s.subject] || 0) + h;
    });
    const subjects = Object.keys(bySub);
    const hours = subjects.map(s => parseFloat(bySub[s].toFixed(2)));

    // daily hours last 14 days
    const days = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return d;
    });
    const dayLabels = days.map(d => d.toLocaleDateString());
    const daily = days.map(d => {
        const ds = d.toDateString();
        const total = sessions.filter(s => s.status === "done" && new Date(s.completedAt || s.start).toDateString() === ds)
            .reduce((sum, s) => sum + (s.duration || 0) / 60, 0);
        return parseFloat(total.toFixed(2));
    });

    return (
        <div>
            <h4>Analytics Snapshot</h4>
            <div className="row">
                <div className="col-md-6">
                    <div className="card p-3 mb-3">
                        <h6 className="mb-3">Study hours per subject</h6>
                        {subjects.length === 0 ? <div className="text-muted">No data yet</div> :
                            <Bar data={{ labels: subjects, datasets: [{ label: "Hours", data: hours }] }} />
                        }
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card p-3 mb-3">
                        <h6 className="mb-3">Daily study (last 14 days)</h6>
                        <Line data={{ labels: dayLabels, datasets: [{ label: "Hours", data: daily, fill: true }] }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
