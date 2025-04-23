import { authState, checkResponse } from "./authentication.js";

console.log("leads.js loaded - Version with edit, delete, stable ordering, and bulk toCall toggle with narrow checkbox column (2025-04-22)");

let allLeads = []; // Store all leads for filtering
let displayedLeads = []; // Track the currently displayed leads

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
        // Sort leads by created_at in descending order (newest first)
        allLeads = leads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        displayedLeads = [...allLeads]; // Initially, displayedLeads is the full sorted list

        renderLeads(displayedLeads); // Render initially
    } catch (err) {
        console.error('Failed to fetch leads:', err);
    }
}

function renderLeads(leads) {
    requestAnimationFrame(() => {
        const tbody = document.querySelector('#leads-leadsTable tbody');
        if (tbody) {
            tbody.innerHTML = '';

            leads.forEach(lead => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', lead.id || '');

                const createdAt = lead.created_at
                    ? new Date(lead.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                      })
                    : '-';

                row.innerHTML = `
                    <td><input type="checkbox" class="lead-select-checkbox"></td>
                    <td class="lead-name">
                        <!--<div class="avatar"></div>-->
                        <span class="display-value">${lead.clientName || '-'}</span>
                        <input type="text" class="edit-input" value="${lead.clientName || ''}" style="display: none;">
                    </td>
                    <td>
                        <div class="display-value">
                            <div class="email">${lead.email || '-'}</div>
                            <div class="phone">${lead.contactNumber || '-'}</div>
                        </div>
                        <div class="edit-input" style="display: none;">
                            <input type="email" class="edit-email" value="${lead.email || ''}">
                            <input type="text" class="edit-phone" value="${lead.contactNumber || ''}">
                        </div>
                    </td>
                    <td>${createdAt}</td>
                    <td class="address">
                        <span class="display-value">${lead.address || '-'}</span>
                        <input type="text" class="edit-input" value="${lead.address || ''}" style="display: none;">
                    </td>
                    <td>
                        <span class="display-value">${lead.called !== undefined ? (lead.called ? 'Yes' : 'No') : '-'}</span>
                        <select class="edit-input" style="display: none;">
                            <option value="true" ${lead.called ? 'selected' : ''}>Yes</option>
                            <option value="false" ${!lead.called ? 'selected' : ''}>No</option>
                        </select>
                    </td>
                    <td>
                        <span class="display-value">${lead.toCall !== undefined ? (lead.toCall ? 'Yes' : 'No') : '-'}</span>
                        <select class="edit-input" style="display: none;">
                            <option value="true" ${lead.toCall ? 'selected' : ''}>Yes</option>
                            <option value="false" ${!lead.toCall ? 'selected' : ''}>No</option>
                        </select>
                    </td>
                    <td class="lead-owner">
                        <!--<div class="avatar"></div>-->
                        <span class="display-value">${lead.oca_bizowner_id || '-'}</span>
                        <input type="number" class="edit-input" value="${lead.oca_bizowner_id || ''}" style="display: none;">
                    </td>
                    <td>
                        <span class="edit-btn" style="cursor: pointer; margin-right: 10px;">✏️</span>
                        <span class="delete-btn" style="cursor: pointer;">🗑️</span>
                        <div class="edit-controls" style="display: none;">
                            <span class="save-btn" style="cursor: pointer; color: #28a745;">✔️</span>
                            <span class="cancel-edit-btn" style="cursor: pointer; color: #dc3545;">❌</span>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
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
}

function setupEventListeners() {
    requestAnimationFrame(() => {
        const overlay = document.getElementById('leads-overlay');
        const popup = document.getElementById('leads-popupForm');
        const leadOptions = document.getElementById('leads-leadOptions');
        const fileInput = document.getElementById('leads-bulkFileInput');
        const searchInput = document.querySelector('.leads-table-header .search-bar input');
        const tbody = document.querySelector('#leads-leadsTable tbody');
        const toggleToCallBtn = document.getElementById('leads-toggleToCallBtn');

        if (!overlay || !popup || !leadOptions || !fileInput || !searchInput || !tbody || !toggleToCallBtn) {
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

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim().toLowerCase();
                displayedLeads = allLeads.filter(lead =>
                    lead.clientName?.toLowerCase().startsWith(query)
                );
                renderLeads(displayedLeads);
            });
        } else {
            console.error('Search input element not found.');
        }

        if (toggleToCallBtn) {
            toggleToCallBtn.addEventListener('click', async () => {
                const selectedCheckboxes = tbody.querySelectorAll('.lead-select-checkbox:checked');
                if (selectedCheckboxes.length === 0) {
                    alert('Please select at least one lead to toggle.');
                    return;
                }

                try {
                    if (!authState.isAuthenticated || !authState.token) {
                        console.log("Not authenticated, redirecting to login");
                        window.location.href = "login.html";
                        return;
                    }

                    for (const checkbox of selectedCheckboxes) {
                        const row = checkbox.closest('tr');
                        const leadId = parseInt(row.getAttribute('data-id'));
                        const lead = allLeads.find(l => l.id === leadId);
                        if (!lead) continue;

                        const updatedLeadData = {
                            oca_leadslist_id: leadId,
                            clientName: lead.clientName || '',
                            email: lead.email || '',
                            address: lead.address || '',
                            contactNumber: lead.contactNumber || '',
                            oca_bizowner_id: lead.oca_bizowner_id || 0,
                            called: lead.called || false,
                            toCall: !lead.toCall // Toggle the toCall value
                        };

                        const response = await fetch(
                            'https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/edit_ocaLead',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${authState.token}`
                                },
                                body: JSON.stringify(updatedLeadData)
                            }
                        );

                        checkResponse(response);

                        if (!response.ok) {
                            const errData = await response.json();
                            throw new Error(errData.message || 'Failed to update lead');
                        }

                        // Update allLeads
                        const leadIndex = allLeads.findIndex(l => l.id === leadId);
                        if (leadIndex !== -1) {
                            allLeads[leadIndex] = { ...allLeads[leadIndex], toCall: updatedLeadData.toCall };
                        }

                        // Update displayedLeads
                        const displayedIndex = displayedLeads.findIndex(l => l.id === leadId);
                        if (displayedIndex !== -1) {
                            displayedLeads[displayedIndex] = { ...displayedLeads[displayedIndex], toCall: updatedLeadData.toCall };
                        }
                    }

                    // Re-render the table
                    renderLeads(displayedLeads);
                    console.log('Selected leads toCall values toggled successfully!');
                } catch (err) {
                    console.error('Error toggling toCall values:', err);
                    alert('Failed to toggle toCall values for some leads.');
                }
            });
        }

        // Edit and Delete functionality
        tbody.addEventListener('click', async (event) => {
            const row = event.target.closest('tr');
            if (!row) return;

            // Prevent checkbox clicks from triggering edit/delete
            if (event.target.classList.contains('lead-select-checkbox')) return;

            const editBtn = event.target.closest('.edit-btn');
            const saveBtn = event.target.closest('.save-btn');
            const cancelBtn = event.target.closest('.cancel-edit-btn');
            const deleteBtn = event.target.closest('.delete-btn');

            if (editBtn) {
                // Enter edit mode
                row.querySelectorAll('.display-value').forEach(el => el.style.display = 'none');
                row.querySelectorAll('.edit-input').forEach(el => el.style.display = 'block');
                row.querySelector('.edit-btn').style.display = 'none';
                row.querySelector('.delete-btn').style.display = 'none';
                row.querySelector('.edit-controls').style.display = 'block';
            } else if (saveBtn) {
                // Save changes
                const leadId = row.getAttribute('data-id');
                const leadData = {
                    oca_leadslist_id: parseInt(leadId),
                    clientName: row.querySelector('.lead-name .edit-input').value,
                    email: row.querySelector('.edit-email').value,
                    contactNumber: row.querySelector('.edit-phone').value,
                    address: row.querySelector('.address .edit-input').value,
                    called: row.querySelector('td:nth-child(6) .edit-input').value === 'true',
                    toCall: row.querySelector('td:nth-child(7) .edit-input').value === 'true',
                    oca_bizowner_id: parseInt(row.querySelector('.lead-owner .edit-input').value || 0)
                };

                try {
                    if (!authState.isAuthenticated || !authState.token) {
                        console.log("Not authenticated, redirecting to login");
                        window.location.href = "login.html";
                        return;
                    }

                    const response = await fetch(
                        `https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/edit_ocaLead`,
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
                        throw new Error(errData.message || 'Failed to update lead');
                    }

                    // Update allLeads
                    const leadIndex = allLeads.findIndex(lead => lead.id === parseInt(leadId));
                    if (leadIndex !== -1) {
                        allLeads[leadIndex] = {
                            ...allLeads[leadIndex],
                            ...leadData,
                            id: parseInt(leadId)
                        };
                    }

                    // Update displayedLeads to reflect the edit
                    const displayedIndex = displayedLeads.findIndex(lead => lead.id === parseInt(leadId));
                    if (displayedIndex !== -1) {
                        displayedLeads[displayedIndex] = {
                            ...displayedLeads[displayedIndex],
                            ...leadData,
                            id: parseInt(leadId)
                        };
                    }

                    // Exit edit mode
                    row.querySelectorAll('.display-value').forEach(el => el.style.display = 'block');
                    row.querySelectorAll('.edit-input').forEach(el => el.style.display = 'none');
                    row.querySelector('.edit-btn').style.display = 'block';
                    row.querySelector('.delete-btn').style.display = 'block';
                    row.querySelector('.edit-controls').style.display = 'none';

                    // Re-render using displayedLeads to preserve the current order
                    renderLeads(displayedLeads);
                    console.log('Lead updated successfully!');
                } catch (err) {
                    console.error('Error updating lead:', err);
                }
            } else if (cancelBtn) {
                // Cancel edit
                row.querySelectorAll('.display-value').forEach(el => el.style.display = 'block');
                row.querySelectorAll('.edit-input').forEach(el => el.style.display = 'none');
                row.querySelector('.edit-btn').style.display = 'block';
                row.querySelector('.delete-btn').style.display = 'block';
                row.querySelector('.edit-controls').style.display = 'none';
            } else if (deleteBtn) {
                // Delete lead
                const leadId = row.getAttribute('data-id');
                const leadName = document.querySelector(`tr[data-id="${leadId}"] td.lead-name span.display-value`)?.textContent;
                const confirmDelete = confirm(`Are you sure you want to delete lead: ${leadName}?`);
                if (!confirmDelete) return;

                try {
                    if (!authState.isAuthenticated || !authState.token) {
                        console.log("Not authenticated, redirecting to login");
                        window.location.href = "login.html";
                        return;
                    }

                    const response = await fetch(
                        'https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/delete_lead',
                        {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authState.token}`
                            },
                            body: JSON.stringify({ oca_leadslist_id: parseInt(leadId) })
                        }
                    );

                    checkResponse(response);

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.message || 'Failed to delete lead');
                    }

                    // Remove the lead from allLeads and displayedLeads
                    allLeads = allLeads.filter(lead => lead.id !== parseInt(leadId));
                    displayedLeads = displayedLeads.filter(lead => lead.id !== parseInt(leadId));

                    // Re-render the table
                    renderLeads(displayedLeads);
                    console.log(`Lead ${leadId} deleted successfully!`);
                } catch (err) {
                    console.error('Error deleting lead:', err);
                }
            }
        });
    });
}

export { fetchLeads, setupEventListeners };