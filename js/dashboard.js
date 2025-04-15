import { loginAndStoreToken, getCookie } from './authentication.js';

async function initDashboard() {
    let token = getCookie('authToken');
    if (!token) {
        try {
            token = await loginAndStoreToken('larry@oracle.com', 'abcd1234');
        } catch (e) {
            alert('Authentication failed');
            return;
        }
    }

    fetchAndRenderReport(token);
}

async function fetchAndRenderReport(token) {
    try {
        const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/dashboardReport', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // Fill cards with updated IDs
        document.getElementById('dashboard-totalCall').textContent = data.totalCall.toLocaleString();
        document.getElementById('dashboard-welcome').textContent = data.welcome.toLocaleString();
        document.getElementById('dashboard-parent').textContent = data.parent.toLocaleString();
        document.getElementById('dashboard-interest').textContent = data.interest.toLocaleString();

        // Draw chart
        renderChart(data);
    } catch (err) {
        console.error(err);
        alert('Failed to load dashboard data.');
    }
}

function renderChart(data) {
    const ctx = document.getElementById('dashboard-callChart').getContext('2d');

    // Calculate the maximum value in the dataset to help with scaling
    const maxWelcome = Math.max(data.welcome, data.welcome * 0.8, data.welcome * 0.6);
    const maxParent = Math.max(data.parent, data.parent * 0.9, data.parent * 0.7);
    const maxValue = Math.max(maxWelcome, maxParent);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Month 1', 'Month 2', 'Month 3'],
            datasets: [
                {
                    label: 'Welcome',
                    data: [data.welcome, data.welcome * 0.8, data.welcome * 0.6], // Simulated variation
                    backgroundColor: '#34D399',
                    barThickness: 20,
                },
                {
                    label: 'Parent',
                    data: [data.parent, data.parent * 0.9, data.parent * 0.7], // Simulated variation
                    backgroundColor: '#6B48FF',
                    barThickness: 20,
                },
                {
                    label: 'Interest',
                    data: [data.interest, data.interest * 0.7, data.interest * 0.5], // Simulated variation
                    backgroundColor: '#34D399',
                    barThickness: 20,
                    hidden: true, // Hide Interest to match the two-dataset style of the target
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
                    suggestedMax: Math.max(10, maxValue * 1.2), // Ensure a minimum scale for small values
                    ticks: {
                        // Let Chart.js automatically determine the step size
                        stepSize: undefined,
                        // Display raw numbers instead of "K" format
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

// Run setup on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initDashboard);