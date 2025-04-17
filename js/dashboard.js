import { authState, checkResponse } from "./authentication.js";

console.log("dashboard.js loaded - Version with authState (2025-04-18)");

function initDashboard() {
    console.log("Initializing dashboard...");
    fetchAndRenderReport();
}

async function fetchAndRenderReport() {
    try {
        if (!authState.isAuthenticated || !authState.token) {
            console.log("Not authenticated, redirecting to login");
            window.location.href = "login.html";
            return;
        }

        const response = await fetch(
            "https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/dashboardReport",
            {
                headers: {
                    Authorization: `Bearer ${authState.token}`,
                },
            }
        );

        checkResponse(response);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const report = await response.json();
        console.log("Dashboard report fetched:", report);

        // Update DOM elements with null checks
        const totalCallEl = document.getElementById("dashboard-totalCall");
        const welcomeEl = document.getElementById("dashboard-welcome");
        const parentEl = document.getElementById("dashboard-parent");
        const interestEl = document.getElementById("dashboard-interest");

        if (totalCallEl) {
            totalCallEl.textContent = report.totalCall || "-";
        } else {
            console.error("Element #dashboard-totalCall not found");
        }

        if (welcomeEl) {
            welcomeEl.textContent =
                report.welcome !== undefined ? report.welcome : "-";
        } else {
            console.error("Element #dashboard-welcome not found");
        }

        if (parentEl) {
            parentEl.textContent =
                report.parent !== undefined ? report.parent : "-";
        } else {
            console.error("Element #dashboard-parent not found");
        }

        if (interestEl) {
            interestEl.textContent =
                report.interest !== undefined ? report.interest : "-";
        } else {
            console.error("Element #dashboard-interest not found");
        }

        // Update latest call table
        const tbody = document.querySelector(
            "#dashboard-latest-call-table tbody"
        );
        if (tbody) {
            tbody.innerHTML = "";
            if (report.latestCallList && report.latestCallList.length > 0) {
                report.latestCallList.forEach((call) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${call.lead_id || "-"}</td>
                        <td>${call.welcomeCall || "-"}</td>
                        <td>${call.targetParent || "-"}</td>
                        <td>${call.productInterest || "-"}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML =
                    '<tr><td colspan="4">No recent calls</td></tr>';
            }
        } else {
            console.error("Table body for #dashboard-latest-call-table not found");
        }

        // Render chart
        renderChart(report);
    } catch (err) {
        console.error("Failed to fetch dashboard report:", err);
    }
}

function renderChart(report) {
    const ctx = document.getElementById("dashboard-callChart")?.getContext("2d");
    if (!ctx) {
        console.error("Canvas #dashboard-callChart not found");
        return;
    }

    if (!report.chartData) {
        console.warn("No chartData provided in report, using placeholder data");
        ctx.canvas.parentElement.innerHTML = '<p>No interaction data available</p>';
        return;
    }

    const labels = report.chartData?.labels || [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
    ];
    const data = report.chartData?.data || [0, 0, 0, 0, 0, 0];

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Interactions",
                    data: data,
                    borderColor: "#6B48FF",
                    backgroundColor: "rgba(107, 72, 255, 0.1)",
                    fill: true,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

export { initDashboard, fetchAndRenderReport, renderChart };