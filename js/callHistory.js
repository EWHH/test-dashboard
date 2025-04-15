import { loginAndStoreToken, getCookie } from "./authentication.js";

let originalCallList = [];

async function fetchCallHistory() {
    try {
        await loginAndStoreToken('larry@oracle.com', 'abcd1234');
        const token = getCookie('authToken');

        const response = await fetch(
            'https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/getCallHistory',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();
        console.log('Call History data:', data);

        originalCallList = data;

        renderTable(originalCallList);
        setupFilters();

    } catch (err) {
        console.error('Error fetching data:', err);
        const stats = document.getElementById('call-history-stats');
        if (stats) {
            stats.innerHTML = `<p style="color: red;">Failed to load data.</p>`;
        }
    }
}

function setupFilters() {
    const filterBtn = document.getElementById('call-history-applyFilters');
    if (!filterBtn) return;

    filterBtn.addEventListener('click', () => {
        const welcomeFilter = document.getElementById('call-history-filterWelcomeCall').value.toLowerCase();
        const parentFilter = document.getElementById('call-history-filterTargetParent').value.toLowerCase();
        const interestFilter = document.getElementById('call-history-filterProductInterest').value.toLowerCase();

        const filtered = originalCallList.filter(call => {
            const welcome = (call.welcomeCall || '').toLowerCase().trim();
            const parent = (call.targetParent || '').toLowerCase().trim();
            const interest = (call.interest || '').toLowerCase().trim();

            return (
                (!welcomeFilter || welcome === welcomeFilter) &&
                (!parentFilter || parent === parentFilter) &&
                (!interestFilter || interest === interestFilter)
            );
        });

        renderTable(filtered);
    });
}

function renderTable(callList) {
    const tbody = document.querySelector('#call-history-callTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    callList.forEach(call => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${call.id}</td>
            <td>${new Date(call.created_at).toLocaleString()}</td>
            <td>${call.callName}</td>
            <td>${call.phoneNumber || 'N/A'}</td>
            <td>${call.callType}</td>
            <td>${call.interest}</td>
            <td>${call.targetParent}</td>
            <td>${call.welcomeCall}</td>
            <td>${call.oca_bizowner_id}</td>
            <td>${call.oca_leadslist_id}</td>
        `;
        tbody.appendChild(row);
    });
}

export { fetchCallHistory, setupFilters, renderTable };