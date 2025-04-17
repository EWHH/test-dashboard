import { authState, checkResponse } from "./authentication.js";

console.log("leads.js loaded - Version with authState (2025-04-18)");

async function fetchLeads() {
    try {
        if (!authState.isAuthenticated || !authState.token) {
            console.log("Not authenticated, redirecting to login");
            window.location.href = "login.html";
            return;
        }

        const response = await fetch(
            'https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/getAllLeads',
            {
                headers: {
                    'Authorization': `Bearer ${authState.token}`
                }
            }
        );

        checkResponse(response);

        const leads = await response.json();

        requestAnimationFrame(() => {
            const tbody = document.querySelector('#leads-leadsTable tbody');
            if (tbody) {
                tbody.innerHTML = '';

                leads.forEach(lead => {
                    const row = document.createElement('tr');

                    const createdAt = lead.created_at
                        ? new Date(lead.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                          })
                        : '-';

                    row.innerHTML = `
                        <td class="lead-name">
                            <div class="avatar"></div>
                            <span>${lead.clientName || '-'}</span>
                        </td>
                        <td>
                            <div class="email">${lead.email || '-'}</div>
                            <div class="phone">${lead.contactNumber || '-'}</div>
                        </td>
                        <td>${createdAt}</td>
                        <td>${lead.address || '-'}</td>
                        <td>${lead.called !== undefined ? (lead.called ? 'Yes' : 'No') : '-'}</td>
                        <td>${lead.toCall !== undefined ? (lead.toCall ? 'Yes' : 'No') : '-'}</td>
                        <td>
                            <div class="avatar"></div>
                            <span>${lead.oca_bizowner_id || '-'}</span>
                        </td>
                    `;
                    tbody.appendChild(row);

                    console.log(`Row HTML for ${lead.clientName}:`, row.innerHTML);
                });

                const leadsCountEl = document.getElementById('leads-leadsCount');
                if (leadsCountEl) {
                    leadsCountEl.textContent = leads.length;
                } else {
                    console.error('Element #leads-leadsCount not found');
                }
            } else {
                console.error('Leads table body not found');
            }
        });
    } catch (err) {
        console.error('Failed to fetch leads:', err);
    }
}

function setupEventListeners() {
    requestAnimationFrame(() => {
        const overlay = document.getElementById('leads-overlay');
        const popup = document.getElementById('leads-popupForm');
        const leadOptions = document.getElementById('leads-leadOptions');
        const fileInput = document.getElementById('leads-bulkFileInput');

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
                        console.log("No valid leads found in file.");
                        return;
                    }

                    try {
                        if (!authState.isAuthenticated || !authState.token) {
                            console.log("Not authenticated, redirecting to login");
                            window.location.href = "login.html";
                            return;
                        }

                        for (const lead of leads) {
                            const res = await fetch(
                                'https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/newLead',
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${authState.token}`
                                    },
                                    body: JSON.stringify(lead)
                                }
                            );

                            checkResponse(res);

                            if (!res.ok) {
                                console.error('Error uploading lead:', await res.text());
                            }
                        }

                        console.log('Bulk lead upload completed!');
                        fetchLeads();
                    } catch (err) {
                        console.error('Bulk upload failed:', err);
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
                    if (!authState.isAuthenticated || !authState.token) {
                        console.log("Not authenticated, redirecting to login");
                        window.location.href = "login.html";
                        return;
                    }

                    const response = await fetch(
                        'https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/newLead',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authState.token}`
                            },
                            body: JSON.stringify(leadData)
                        }
                    );

                    checkResponse(response);

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.message || 'Failed to add lead');
                    }

                    form.reset();
                    console.log('Lead added successfully!');
                    hidePopup();
                    fetchLeads();
                } catch (err) {
                    console.error('Error adding lead:', err);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Add';
                }
            });
        } else {
            console.error('leads-leadForm element not found.');
        }
    });
}

export { fetchLeads, setupEventListeners };