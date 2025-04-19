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

    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        ctx.canvas.parentElement.innerHTML = '<p>Failed to load chart library</p>';
        return;
    }

    // Calculate the maximum value for scaling
    const maxWelcome = Math.max(report.welcome || 0, (report.welcome || 0) * 0.8, (report.welcome || 0) * 0.6);
    const maxParent = Math.max(report.parent || 0, (report.parent || 0) * 0.9, (report.parent || 0) * 0.7);
    const maxValue = Math.max(maxWelcome, maxParent);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Month 1', 'Month 2', 'Month 3'],
            datasets: [
                {
                    label: 'Welcome',
                    data: [report.welcome || 0, (report.welcome || 0) * 0.8, (report.welcome || 0) * 0.6],
                    backgroundColor: '#34D399',
                    barThickness: 20,
                },
                {
                    label: 'Parent',
                    data: [report.parent || 0, (report.parent || 0) * 0.9, (report.parent || 0) * 0.7],
                    backgroundColor: '#6B48FF',
                    barThickness: 20,
                },
                {
                    label: 'Interest',
                    data: [report.interest || 0, (report.interest || 0) * 0.7, (report.interest || 0) * 0.5],
                    backgroundColor: '#34D399',
                    barThickness: 20,
                    hidden: true, // Hide Interest dataset
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(10, maxValue * 1.2),
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    },
                    grid: {
                        drawBorder: false,
                    }
                }
            }
        }
    });
}

export { initDashboard, fetchAndRenderReport, renderChart };