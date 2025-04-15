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

    // Fill cards
    document.getElementById('totalCall').textContent = data.totalCall;
    document.getElementById('welcome').textContent = data.welcome;
    document.getElementById('parent').textContent = data.parent;
    document.getElementById('interest').textContent = data.interest;

    // Fill table
    const tbody = document.getElementById('latestCallList');
    let rows = '';
    data.latestCallList.forEach(item => {
      rows += `
        <tr>
          <td>${item.lead_id}</td>
          <td>${item.welcomeCall}</td>
          <td>${item.targetParent}</td>
          <td>${item.productInterest}</td>
        </tr>
      `;
    });
    tbody.innerHTML = rows;

    // Draw chart
    renderChart(data);
  } catch (err) {
    console.error(err);
    alert('Failed to load dashboard data.');
  }
}

function renderChart(data) {
  const ctx = document.getElementById('callChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Welcome', 'Parent', 'Interest'],
      datasets: [{
        label: 'Calls',
        data: [data.welcome, data.parent, data.interest],
        backgroundColor: ['#8B5CF6', '#10B981', '#F59E0B'],
        borderRadius: 6,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', initDashboard);
