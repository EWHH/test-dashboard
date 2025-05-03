import { authState, checkResponse } from "./authentication.js";

console.log("dashboard.js loaded - Version with smooth bar animation (2025-05-03)");

// Configuration for API fields, DOM elements, chart properties, table fields, and display labels
const fieldConfig = {
    totalCall: {
        apiKey: "totalCall",
        domId: "dashboard-totalCall",
        chartLabel: "Total Calls",
        chartColor: "#FF6B6B",
        chartImageSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAP1BMVEVHcEz4am32am35am35am3zaW7xaW/5amz3am3hZ3PuaW/1am75am34am3vaW/6amzqaHD6amz4am2fXoTaZnTHDGJlAAAAFXRSTlMAe0upoC4jsF8IEz+WjRjKDb1sAQO1wsI3AAAA5UlEQVQoz21SibLDIAgEBLyvNP//rc88bdKm2WFGGNaVQ4A7BGmHB6hB454SlIa9pv8SCpeSdby9SZa5nFI9ubYuJIJhE3veLlnM0cryHbcrEZD7wfMe9GQsNTVOkRn5p1LtfRPZarwnmqHmXCMTfvryOaXsz/LecFhsC7bg/RHKnhHZ5/sNqlIQi9TvRMExUwqBxoHr+V3Ej7hA5GpTPDizZLTGTletHhvao8k5C1TVrrNH9qvZ6lyHTquphnXNqdhSKhDz0kybmVvZ0XD+n+kBbwQWBXyM/mMrY7bh6Rc0h/oR/gFEYQem3mJgaAAAAABJRU5ErkJggg==",
        tableField: "lead_id",
        displayLabel: "Total Calls"
    },
    metric1: {
        apiKey: "welcome",
        domId: "dashboard-welcome",
        chartLabel: "Welcome",
        chartColor: "#34D399",
        chartImageSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAS1BMVEVHcEwz0Jkwypoz0Joy0JkuxJsxy5oy0JowyJsyz5oyz5oxzJoyzpoy0Jkyz5oyzpoyz5oyzpoz0JkxzZosv5wyz5oyz5oy0Jkz0JkNgwOLAAAAGXRSTlMAqhaZogghjQ5ifSpLsHhAVEbKMwOAbrnAoTRpSQAAAOxJREFUKM9tUQmSBCEIE/A+26OP/790ndGd3nYnZZVYEQiBsRUubo19gYQdtm/EplimT3bGu1IwdMzYB+IfRp5k9IzJv85AU8dd1qp01t8WXN8E7vw0/RaCyVAfUpoE4yznlpt/8s/rcO4oaSU0ZL1tOoNeiExCESlBeSFMxKB1wLg28f1zjD3NrxaVKmPEWp4GogULHtH3y053mnMiw44s0QWU+rQwJFuAMEIZ3HtDGZRSlRUpLzdm5GIOW4w52eX9GErHMn1CQCzMcz5r0gGjb+uuqbenLwhwjM8UkZK4JUfa7z0+bDTR/Xn+APJRCRjN4TiQAAAAAElFTkSuQmCC",
        tableField: "welcomeCall",
        displayLabel: "Welcome"
    },
    metric2: {
        apiKey: "parent",
        domId: "dashboard-parent",
        chartLabel: "Parent",
        chartColor: "#6B48FF",
        chartImageSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAOVBMVEVHcExoSP1kSPpoSP1nSPxnSP1eSPZmSPtlSPtoSP1oSP1nSP1oSP1iSPlpSP5oSP1oSP1pSP5oSP1OYVgKAAAAE3RSTlMAfBaqQ08HLyKjnGKwDsmNlbtvh1Rk2AAAANxJREFUKM9tUgkSwyAIFATE+/j/Y5tUm7Q2jDOCy7GuGrObAxbzYGrBxieAm6FwVRPenVIM45OUgr8Q7S3m5Tc+1zSp424LlZL7VPt8Awihn0REjF4ZF8mo4D34P6ba+3BuFNqBbCkzZ7J5A6hJba1K20siYMo5IexDuEoACFJ5B4pDAHTlF0A4NGVEPjZY6ohzQmdEoaRAZ86cD8mm6WrSSdDWWp0pqn0eqF8vpyXGbgrzvFSGsnRCi1gOOf3q2YZdcw/V6lvTNwnrjF8lQvT1H0aA+x1/ZIygX+ELtnAHAV+M4vUAAAAASUVORK5CYII=",
        tableField: "targetParent",
        displayLabel: "Parent"
    },
    metric3: {
        apiKey: "interest",
        domId: "dashboard-interest",
        chartLabel: "Interest",
        chartColor: "#FBBF24",
        chartImageSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAS1BMVEVHcEz1vCfruC30vCjdsTT1vCf0vCjyuyn1vCftuSzvuSr0vCfnti/zuyjyuyn1vCfzuyjyuyn2vSf1vCf2vSfVrTntuSvwuir0vChF3JUhAAAAGXRSTlMAqhZ+CKNiS5wfLI0OeECxVEbKlb0DJjRubOvFUAAAAOtJREFUKM9tkVkWwyAIRUVxnuKQxP2vtEm1sfWUH+A8ZbgQsprx207+mAYG2z9hKySp53eis1IUqo1YRsUfRdci3IiVJEWOeLdtlmU2xPPTgrspUKaquDwi0c+LUUCDOBjnjIt1yqPWZkzLYRUcJLdtLoFbhFTQlmKxpEUQnkbnIvVrE2lRea/QyhVRNtp7feZfgJRdTCWl8nJs0NmNwXRnQWVQ4X7TR2YAsYc6Hu8LJbDWniRrXY/OleNYNgtRSZWyL+V8NqMjUJqJ5HzULA163/2iZt9Mb0MwhA+0GALOkb1i844/GIU/vtIXghsJdVeu7tUAAAAASUVORK5CYII=",
        tableField: "productInterest",
        displayLabel: "Interest"
    }
};

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

        // Update metrics and labels in DOM
        Object.entries(fieldConfig).forEach(([key, config]) => {
            // Update metric value
            const valueEl = document.getElementById(config.domId);
            if (valueEl) {
                const value = report[config.apiKey];
                valueEl.textContent = value !== undefined ? value : "-";
            } else {
                console.error(`Element #${config.domId} not found`);
            }

            // Update label
            const labelEl = document.querySelector(`.dashboard-card-label[data-metric="${key}"]`);
            if (labelEl) {
                labelEl.textContent = config.displayLabel;
            } else {
                console.error(`Label element for metric ${key} not found`);
            }
        });

        // Update latest call table
        const tbody = document.querySelector("#dashboard-latest-call-table tbody");
        if (tbody) {
            tbody.innerHTML = "";
            if (report.latestCallList && report.latestCallList.length > 0) {
                report.latestCallList.forEach((call) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${call[fieldConfig.totalCall.tableField] || "-"}</td>
                        <td>${call[fieldConfig.metric1.tableField] || "-"}</td>
                        <td>${call[fieldConfig.metric2.tableField] || "-"}</td>
                        <td>${call[fieldConfig.metric3.tableField] || "-"}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4">No recent calls</td></tr>';
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

    // Prepare chart datasets and images
    const datasets = [];
    const images = [];
    Object.entries(fieldConfig).forEach(([key, config], index) => {
        const value = report[config.apiKey];
        const dataValue = value !== undefined ? value : 0;
        datasets.push({
            label: config.chartLabel,
            data: [dataValue, dataValue - 1, dataValue - 2],
            backgroundColor: config.chartColor,
            barThickness: 15
        });
        const img = new Image();
        img.src = config.chartImageSrc;
        images.push(img);
    });

    // Calculate max value for scaling
    const maxValues = datasets.map(ds => Math.max(...ds.data));
    const maxValue = Math.max(...maxValues);

    // Wait for all images to load
    Promise.all(images.map(img => new Promise(resolve => img.onload = resolve)))
        .then(() => {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Month 1', 'Month 2', 'Month 3'],
                    datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.datasets.length) {
                                        return data.datasets.map((dataset, i) => ({
                                            text: dataset.label,
                                            fillStyle: dataset.backgroundColor,
                                            strokeStyle: 'rgba(0,0,0,0.2)',
                                            lineWidth: 1,
                                            pointStyle: images[i],
                                            hidden: !chart.isDatasetVisible(i),
                                            datasetIndex: i
                                        }));
                                    }
                                    return [];
                                },
                                usePointStyle: true,
                                pointStyleWidth: 16,
                                padding: 20
                            },
                            onClick: function(e, legendItem, legend) {
                                const chart = legend.chart;
                                const index = legendItem.datasetIndex;
                                const meta = chart.getDatasetMeta(index);
                                meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
                                chart.update();
                            }
                        }
                    },
                    animation: {
                        duration: 1, // Animation duration in milliseconds
                        easing: 'easeInOutQuad', // Smooth easing function
                        x: {
                            from: (ctx) => {
                                // Start the x position at the final position to prevent sliding
                                return ctx.chart.scales.x.getPixelForValue(ctx.index);
                            }
                        },
                        y: {
                            from: (ctx) => {
                                // Start the y position at the bottom (zero) to grow upwards
                                return ctx.chart.scales.y.getPixelForValue(0);
                            }
                        },
                        opacity: {
                            from: 0,
                            to: 1
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
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
                                drawBorder: false
                            }
                        }
                    }
                }
            });
        });

    // Handle image loading errors
    images.forEach((img, i) => {
        img.onerror = function() {
            console.error(`Failed to load image for dataset ${i}`);
        };
    });
}

export { initDashboard, fetchAndRenderReport, renderChart };