import { loginAndStoreToken, getCookie } from "./authentication.js";

async function fetchLeads() {
    try {
        await loginAndStoreToken('larry@oracle.com', 'abcd1234');

        const token = getCookie('authToken');
        if (!token) throw new Error('No auth token found');

        const response = await fetch(
            'https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/getAllLeads',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const leads = await response.json();

        const tbody = document.querySelector('#leads-leadsTable tbody');
        tbody.innerHTML = '';

        leads.forEach(lead => {
            const row = document.createElement('tr');
            const createdAtDate = new Date(lead.created_at);
            const formattedDate = createdAtDate.toLocaleString();

            row.innerHTML = `
                <td>${lead.clientName}</td>
                <td>${lead.email}</td>
                <td>${lead.address}</td>
                <td>${lead.contactNumber}</td>
                <td class="leads-status-${lead.called ? 'true' : 'false'}">${lead.called}</td>
                <td class="leads-status-${lead.toCall ? 'true' : 'false'}">${lead.toCall}</td>
                <td>${formattedDate}</td>
            `;
            tbody.appendChild(row);
        });

        // Update the Leads count in the metric card
        document.getElementById('leads-leadsCount').textContent = leads.length;

    } catch (err) {
        console.error('Failed to fetch leads:', err);
    }
}

function setupEventListeners() {
    const overlay = document.getElementById('leads-overlay');
    const popup = document.getElementById('leads-popupForm');
    const leadOptions = document.getElementById('leads-leadOptions');
    const fileInput = document.getElementById('leads-bulkFileInput');

    // Safety checks to ensure elements exist
    if (!overlay || !popup || !leadOptions || !fileInput) {
        console.error('One or more required DOM elements are missing in Leads view.');
        return;
    }

    function showPopup() {
        popup.style.display = 'block';
        overlay.style.display = 'block';
    }

    function hidePopup() {
        popup.style.display = 'none';
        overlay.style.display = 'none';
    }

    function showLeadOptions() {
        overlay.style.display = 'block';
        leadOptions.style.display = 'block';
    }

    function hideLeadOptions() {
        overlay.style.display = 'none';
        leadOptions.style.display = 'none';
    }

    const addLeadBtn = document.getElementById('leads-addLeadBtn');
    const cancelLeadOptionBtn = document.getElementById('leads-cancelLeadOptionBtn');
    const singleLeadBtn = document.getElementById('leads-singleLeadBtn');
    const bulkLeadBtn = document.getElementById('leads-bulkLeadBtn');
    const cancelBtn = document.getElementById('leads-cancelBtn');
    const leadForm = document.getElementById('leads-leadForm');

    if (addLeadBtn) {
        addLeadBtn.addEventListener('click', showLeadOptions);
    } else {
        console.error('leads-addLeadBtn element not found.');
    }

    if (cancelLeadOptionBtn) {
        cancelLeadOptionBtn.addEventListener('click', hideLeadOptions);
    } else {
        console.error('leads-cancelLeadOptionBtn element not found.');
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            hidePopup();
            hideLeadOptions();
        });
    }

    if (singleLeadBtn) {
        singleLeadBtn.addEventListener('click', () => {
            hideLeadOptions();
            showPopup();
        });
    } else {
        console.error('leads-singleLeadBtn element not found.');
    }

    if (bulkLeadBtn) {
        bulkLeadBtn.addEventListener('click', () => {
            fileInput.click();
        });
    } else {
        console.error('leads-bulkLeadBtn element not found.');
    }

    if (fileInput) {
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                const lines = e.target.result.split('\n').filter(line => line.trim() !== '');
                const leads = [];

                for (let i = 0; i < lines.length; i++) {
                    const [clientName, email, address, contactNumber] = lines[i].split(',').map(s => s.trim());
                    if (clientName && email && address && contactNumber) {
                        leads.push({ clientName, email, address, contactNumber });
                    }
                }

                if (leads.length === 0) {
                    alert("No valid leads found in file.");
                    return;
                }

                try {
                    const token = getCookie('authToken');
                    if (!token) throw new Error('No auth token found');

                    for (const lead of leads) {
                        const res = await fetch(
                            'https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/newLead',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(lead)
                            }
                        );

                        if (!res.ok) {
                            console.error('Error uploading lead:', await res.text());
                        }
                    }

                    alert('Bulk lead upload completed!');
                    fetchLeads();
                } catch (err) {
                    console.error('Bulk upload failed:', err);
                    alert('Failed to upload leads.');
                } finally {
                    hideLeadOptions();
                    fileInput.value = '';
                }
            };

            reader.readAsText(file);
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', hidePopup);
    } else {
        console.error('leads-cancelBtn element not found.');
    }

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            const leadData = {
                clientName: form.clientName.value,
                email: form.email.value,
                address: form.address.value,
                contactNumber: form.contactNumber.value
            };

            try {
                const token = getCookie('authToken');
                if (!token) throw new Error('No auth token found');

                const response = await fetch(
                    'https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/newLead',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(leadData)
                    }
                );

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to add lead');
                }

                form.reset();
                alert('Lead added successfully!');
                hidePopup();
                fetchLeads();
            } catch (err) {
                console.error('Error adding lead:', err);
                alert(`Failed to add lead: ${err.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add';
            }
        });
    } else {
        console.error('leads-leadForm element not found.');
    }
}

export { fetchLeads, setupEventListeners };