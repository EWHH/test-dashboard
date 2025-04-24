import { authState, checkResponse } from './authentication.js';

// Cache for full call list to enable client-side filtering
let allCalls = [];
let displayedCalls = []; // Track calls currently displayed in the table

console.log("callHistory.js loaded - Version with email sending feature (2025-04-23)");

export async function fetchCallHistory() {
    try {
        if (!authState.isAuthenticated || !authState.token) {
            console.log('Not authenticated, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/getCallHistory', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authState.token}`,
                'Content-Type': 'application/json'
            }
        });

        checkResponse(response);

        if (!response.ok) {
            throw new Error(`Failed to fetch call history: ${response.status} ${response.statusText}`);
        }

        allCalls = await response.json();
        console.log('Fetched calls:', allCalls);
        displayedCalls = [...allCalls]; // Initialize displayedCalls with all calls

        renderTable(displayedCalls);
    } catch (error) {
        console.error('Error fetching call history:', error.message);
        renderTable([]);
        updateCallCount(0);
        allCalls = [];
        displayedCalls = [];
    }
}

export function renderTable(calls) {
    requestAnimationFrame(() => {
        const tbody = document.querySelector('#call-history-callTable tbody');
        if (!tbody) {
            console.error('Call history table body not found');
            updateCallCount(0);
            displayedCalls = [];
            return;
        }

        tbody.innerHTML = '';
        console.log('Rendering calls:', calls);
        displayedCalls = calls || []; // Update displayedCalls to match rendered calls

        displayedCalls.forEach(call => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', call.id || '');
            row.innerHTML = `
                <td><input type="checkbox" class="call-select-checkbox"></td>
                <td>${call.id || '-'}</td>
                <td>${call.created_at ? new Date(call.created_at).toLocaleString() : '-'}</td>
                <td>${call.callName || '-'}</td>
                <td>${call.phoneNumber || '-'}</td>
                <td>${call.callType || '-'}</td>
                <td>${call.interest || '-'}</td>
                <td>${call.targetParent || '-'}</td>
                <td>${call.welcomeCall || '-'}</td>
                <td>${call.oca_bizowner_id || '-'}</td>
                <td>${call.oca_leadslist_id || '-'}</td>
            `;
            tbody.appendChild(row);
        });

        updateCallCount(displayedCalls.length);
    });
}

function updateCallCount(count) {
    requestAnimationFrame(() => {
        const countElement = document.querySelector('#call-history-callCount');
        if (countElement) {
            console.log('Updating call count to:', count);
            countElement.textContent = count;
        } else {
            console.error('Call count element not found');
        }
    });
}

function escapeCsvValue(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function exportToCsv(calls) {
    console.log('Exporting calls to CSV:', calls);
    if (!calls || calls.length === 0) {
        console.warn('No calls to export');
        alert('No calls available to export.');
        return;
    }

    // Define CSV headers
    const headers = [
        'ID',
        'Created At',
        'Call Name',
        'Phone Number',
        'Call Type',
        'Interest',
        'Target Parent',
        'Welcome Call',
        'Biz Owner ID',
        'Leads List ID'
    ];

    // Map calls to CSV rows
    const rows = calls.map(call => [
        escapeCsvValue(call.id),
        escapeCsvValue(call.created_at ? new Date(call.created_at).toISOString() : ''),
        escapeCsvValue(call.callName),
        escapeCsvValue(call.phoneNumber),
        escapeCsvValue(call.callType),
        escapeCsvValue(call.interest),
        escapeCsvValue(call.targetParent),
        escapeCsvValue(call.welcomeCall),
        escapeCsvValue(call.oca_bizowner_id),
        escapeCsvValue(call.oca_leadslist_id)
    ].join(','));

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `call_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('CSV export triggered');
}

function applyFilters(searchTerm, welcomeCall, targetParent, interest, startDate, endDate) {
    try {
        console.log('Applying filters with:', { searchTerm, welcomeCall, targetParent, interest, startDate, endDate });
        let filteredCalls = [...allCalls];

        if (searchTerm) {
            filteredCalls = filteredCalls.filter(call =>
                (call.callName || '').toLowerCase().startsWith(searchTerm.toLowerCase())
            );
            console.log('After search filter:', filteredCalls);
        }

        if (welcomeCall) {
            filteredCalls = filteredCalls.filter(call =>
                call.welcomeCall === welcomeCall
            );
            console.log('After welcomeCall filter:', filteredCalls);
        }

        if (targetParent) {
            filteredCalls = filteredCalls.filter(call =>
                call.targetParent === targetParent
            );
            console.log('After targetParent filter:', filteredCalls);
        }

        if (interest) {
            filteredCalls = filteredCalls.filter(call =>
                call.interest === interest
            );
            console.log('After interest filter:', filteredCalls);
        }

        if (startDate) {
            const start = new Date(startDate);
            filteredCalls = filteredCalls.filter(call => {
                const callDate = new Date(call.created_at);
                return callDate >= start;
            });
            console.log('After startDate filter:', filteredCalls);
        }

        if (endDate) {
            const end = new Date(endDate);
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);
            filteredCalls = filteredCalls.filter(call => {
                const callDate = new Date(call.created_at);
                return callDate <= end;
            });
            console.log('After endDate filter:', filteredCalls);
        }

        console.log('Final filtered calls:', filteredCalls);
        renderTable(filteredCalls);
    } catch (error) {
        console.error('Error applying filters:', error.message);
        renderTable([]);
        displayedCalls = [];
    }
}

function setupEmailPopup() {
    const overlay = document.querySelector('#leads-overlay');
    const emailPopup = document.querySelector('#call-history-emailPopup');
    const emailForm = document.querySelector('#call-history-emailForm');
    const cancelEmailBtn = document.querySelector('#call-history-cancelEmailBtn');

    function showEmailPopup() {
        overlay.style.display = 'block';
        emailPopup.style.display = 'block';
    }

    function hideEmailPopup() {
        overlay.style.display = 'none';
        emailPopup.style.display = 'none';
        emailForm.reset();
    }

    cancelEmailBtn.addEventListener('click', hideEmailPopup);
    overlay.addEventListener('click', hideEmailPopup);

    return { showEmailPopup, hideEmailPopup, emailForm };
}

export function setupFilters() {
    requestAnimationFrame(() => {
        const searchInput = document.querySelector('#call-history-search');
        const welcomeCallFilter = document.querySelector('#call-history-filterWelcomeCall');
        const targetParentFilter = document.querySelector('#call-history-filterTargetParent');
        const productInterestFilter = document.querySelector('#call-history-filterProductInterest');
        const startDateFilter = document.querySelector('#call-history-filterStartDate');
        const endDateFilter = document.querySelector('#call-history-filterEndDate');
        const applyFiltersButton = document.querySelector('#call-history-applyFilters');
        const exportCsvButton = document.querySelector('#call-history-exportCsv');
        const sendEmailButton = document.querySelector('#call-history-sendEmail');
        const tbody = document.querySelector('#call-history-callTable tbody');

        console.log('Setting up filters. Elements found:', {
            searchInput: !!searchInput,
            welcomeCallFilter: !!welcomeCallFilter,
            targetParentFilter: !!targetParentFilter,
            productInterestFilter: !!productInterestFilter,
            startDateFilter: !!startDateFilter,
            endDateFilter: !!endDateFilter,
            applyFiltersButton: !!applyFiltersButton,
            exportCsvButton: !!exportCsvButton,
            sendEmailButton: !!sendEmailButton,
            tbody: !!tbody
        });

        if (!searchInput || !welcomeCallFilter || !targetParentFilter || !productInterestFilter || 
            !startDateFilter || !endDateFilter || !applyFiltersButton || !exportCsvButton || !sendEmailButton || !tbody) {
            console.error('One or more filter elements not found');
            return;
        }

        // Set max attribute for startDateFilter to current date
        const today = new Date().toISOString().split('T')[0];
        startDateFilter.setAttribute('max', today);
        console.log('Set max date for startDateFilter:', today);

        // Set min attribute for endDateFilter to current date initially
        endDateFilter.setAttribute('min', today);
        console.log('Set min date for endDateFilter:', today);

        // Cache current filter values
        let currentFilters = {
            welcomeCall: welcomeCallFilter.value,
            targetParent: targetParentFilter.value,
            interest: productInterestFilter.value,
            startDate: startDateFilter.value,
            endDate: endDateFilter.value
        };

        // Update filter cache and validate dates when inputs change
        welcomeCallFilter.addEventListener('change', () => {
            currentFilters.welcomeCall = welcomeCallFilter.value;
            console.log('Updated welcomeCall filter:', currentFilters.welcomeCall);
        });

        targetParentFilter.addEventListener('change', () => {
            currentFilters.targetParent = targetParentFilter.value;
            console.log('Updated targetParent filter:', currentFilters.targetParent);
        });

        productInterestFilter.addEventListener('change', () => {
            currentFilters.interest = productInterestFilter.value;
            console.log('Updated interest filter:', currentFilters.interest);
        });

        startDateFilter.addEventListener('change', () => {
            currentFilters.startDate = startDateFilter.value;
            console.log('Updated startDate filter:', currentFilters.startDate);
            // Ensure endDate is not before startDate
            if (currentFilters.startDate && currentFilters.endDate && currentFilters.endDate < currentFilters.startDate) {
                currentFilters.endDate = currentFilters.startDate;
                endDateFilter.value = currentFilters.endDate;
                console.log('Adjusted endDate to match startDate:', currentFilters.endDate);
            }
            // Set min attribute for endDateFilter to startDate
            endDateFilter.setAttribute('min', currentFilters.startDate || today);
        });

        endDateFilter.addEventListener('change', () => {
            currentFilters.endDate = endDateFilter.value;
            console.log('Updated endDate filter:', currentFilters.endDate);
            // Validate endDate is not before startDate
            if (currentFilters.startDate && currentFilters.endDate && currentFilters.endDate < currentFilters.startDate) {
                currentFilters.endDate = currentFilters.startDate;
                endDateFilter.value = currentFilters.endDate;
                console.log('Adjusted endDate to match startDate:', currentFilters.endDate);
            }
        });

        // Search as user types
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim();
            console.log('Search input changed:', searchTerm);
            applyFilters(
                searchTerm, 
                currentFilters.welcomeCall, 
                currentFilters.targetParent, 
                currentFilters.interest,
                currentFilters.startDate,
                currentFilters.endDate
            );
        });

        // Apply all filters on button click
        applyFiltersButton.addEventListener('click', () => {
            console.log('Apply Filters button clicked');
            const searchTerm = searchInput.value.trim();
            applyFilters(
                searchTerm, 
                currentFilters.welcomeCall, 
                currentFilters.targetParent, 
                currentFilters.interest,
                currentFilters.startDate,
                currentFilters.endDate
            );
        });

        // Export to CSV on button click
        exportCsvButton.addEventListener('click', () => {
            console.log('Export to CSV button clicked');
            exportToCsv(displayedCalls);
        });

        // Setup email popup
        const { showEmailPopup, hideEmailPopup, emailForm } = setupEmailPopup();

        // Send email on button click
        sendEmailButton.addEventListener('click', () => {
            const selectedCheckboxes = tbody.querySelectorAll('.call-select-checkbox:checked');
            if (selectedCheckboxes.length === 0) {
                alert('Please select at least one call to send.');
                return;
            }
            showEmailPopup();
        });

        // Handle email form submission
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                const selectedCheckboxes = tbody.querySelectorAll('.call-select-checkbox:checked');
                const selectedCalls = Array.from(selectedCheckboxes).map(checkbox => {
                    const row = checkbox.closest('tr');
                    const callId = parseInt(row.getAttribute('data-id'));
                    return displayedCalls.find(call => call.id === callId);
                });

                const emailData = {
                    leads_list: selectedCalls.map(call => ({
                        name: call.callName || '',
                        contact_number: call.phoneNumber || '',
                        last_contact_date: call.created_at ? new Date(call.created_at).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric'
                        }) : '',
                        interest_in_product: call.interest || '',
                        parent_with_kids: call.targetParent || ''
                    })),
                    email: form.recipientEmail.value,
                    name: form.recipientName.value
                };

                if (!authState.isAuthenticated || !authState.token) {
                    console.log('Not authenticated, redirecting to login');
                    window.location.href = 'login.html';
                    return;
                }

                const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/email_leads_toAgents', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authState.token}`
                    },
                    body: JSON.stringify(emailData)
                });

                checkResponse(response);

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to send email');
                }

                console.log('Email sent successfully!');
                alert('Email sent successfully!');
                hideEmailPopup();

                // Uncheck all checkboxes after sending
                selectedCheckboxes.forEach(checkbox => checkbox.checked = false);
            } catch (error) {
                console.error('Error sending email:', error.message);
                alert('Failed to send email. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send';
            }
        });
    });
}