const { useState, useEffect } = React;

function TaskInsightsPanel() {
    const STORAGE_KEY = "study_planner_prof_v1";
    const [tasks, setTasks] = useState([]);
    const [quote, setQuote] = useState("Loading your motivation...");
    const [stats, setStats] = useState({ done: 0, overdue: 0, upcoming: 0 });

    // Load from localStorage
    const loadTasks = () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch {
            return [];
        }
    };

    // Compute task statistics
    const computeStats = (all) => {
        const now = new Date();
        const done = all.filter(t => t.lane === "done").length;
        const overdue = all.filter(t => t.due && t.lane !== "done" && new Date(t.due) < now).length;
        const upcoming = all.filter(t => t.due && new Date(t.due) > now && t.lane !== "done").length;
        setStats({ done, overdue, upcoming });
    };

    // Load data on start and watch for changes
    useEffect(() => {
        const update = () => {
            const all = loadTasks();
            setTasks(all);
            computeStats(all);
        };
        update();
        window.addEventListener("storage", update);
        return () => window.removeEventListener("storage", update);
    }, []);

    // Fetch motivational quote
    async function fetchQuote() {
        try {
            const res = await fetch("https://api.quotable.io/random?tags=motivational|success|education");
            const data = await res.json();
            setQuote(`"${data.content}" — ${data.author}`);
        } catch {
            setQuote("Discipline beats motivation — every single day.");
        }
    }

    useEffect(() => { fetchQuote(); }, []);

    const total = tasks.length || 1;
    const pct = Math.round((stats.done / total) * 100);

    return (
        React.createElement("div", {
            className: "card my-4 p-3 shadow-sm",
            style: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }
        },
            React.createElement("h5", { style: { color: "var(--accent)" } }, "📊 React Task Insights"),
            React.createElement("div", {
                style: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }
            },
                React.createElement("div", { className: "badge bg-success-subtle text-success" }, `✅ Completed: ${stats.done}`),
                React.createElement("div", { className: "badge bg-warning-subtle text-warning" }, `⚠️ Overdue: ${stats.overdue}`),
                React.createElement("div", { className: "badge bg-info-subtle text-info" }, `📅 Upcoming: ${stats.upcoming}`),
                React.createElement("div", { className: "badge bg-primary-subtle text-primary" }, `🎯 Progress: ${pct}%`)
            ),
            React.createElement("div", { className: "mt-3" },
                React.createElement("strong", null, "Motivational Quote"),
                React.createElement("div", { className: "alert alert-light mt-2", style: { fontStyle: "italic" } }, quote)
            )
        )
    );
}

// Mount the React component dynamically into the page
window.addEventListener("DOMContentLoaded", () => {
    const mount = document.createElement("div");
    mount.id = "react-panel";
    const analyticsSection = document.querySelector(".analytics");
    if (analyticsSection) analyticsSection.before(mount);
    const root = ReactDOM.createRoot(mount);
    root.render(React.createElement(TaskInsightsPanel));
});
