import { getCookie } from './authentication.js';

// Cache for full call list to enable client-side filtering
let allCalls = [];

/**
 * Fetches call history data from the API and renders it in the table.
 * Updates the call count based on the displayed rows.
 */
export async function fetchCallHistory() {
    try {
        const token = getCookie('authToken');
        if (!token) {
            throw new Error('No auth token found. Please log in.');
        }

        const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:ulG9WHn0/getCallHistory', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch call history: ${response.status} ${response.statusText}`);
        }

        allCalls = await response.json();
        console.log('Fetched calls:', allCalls); // Debug: Log raw API response

        // Render the table and update count
        renderTable(allCalls);
    } catch (error) {
        console.error('Error fetching call history:', error.message);
        renderTable([]); // Clear table on error
        updateCallCount(0);
        allCalls = [];
    }
}

/**
 * Renders the call history table with the provided calls.
 * @param {Array} calls - Array of call objects to display
 */
export function renderTable(calls) {
    const tbody = document.querySelector('#call-history-callTable tbody');
    if (!tbody) {
        console.error('Call history table body not found');
        updateCallCount(0);
        return;
    }

    tbody.innerHTML = ''; // Clear existing rows to prevent stale data
    console.log('Rendering calls:', calls); // Debug: Log data being rendered

    (calls || []).forEach(call => {
        const row = document.createElement('tr');
        row.innerHTML = `
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

    // Update count based on rendered rows
    updateCallCount(calls ? calls.length : 0);
}

/**
 * Updates the call count display.
 * @param {number} count - Number of calls to display
 */
function updateCallCount(count) {
    const countElement = document.querySelector('#call-history-callCount');
    if (countElement) {
        console.log('Updating call count to:', count); // Debug: Log count update
        countElement.textContent = count;
    } else {
        console.error('Call count element not found');
    }
}

/**
 * Sets up event listeners for search and filter controls.
 */
export function setupFilters() {
    const searchInput = document.querySelector('#call-history-search');
    const welcomeCallFilter = document.querySelector('#call-history-filterWelcomeCall');
    const targetParentFilter = document.querySelector('#call-history-filterTargetParent');
    const productInterestFilter = document.querySelector('#call-history-filterProductInterest');
    const applyFiltersButton = document.querySelector('#call-history-applyFilters');

    console.log('Setting up filters. Elements found:', {
        searchInput: !!searchInput,
        welcomeCallFilter: !!welcomeCallFilter,
        targetParentFilter: !!targetParentFilter,
        productInterestFilter: !!productInterestFilter,
        applyFiltersButton: !!applyFiltersButton
    });

    if (!searchInput || !welcomeCallFilter || !targetParentFilter || !productInterestFilter || !applyFiltersButton) {
        console.error('One or more filter elements not found');
        return;
    }

    applyFiltersButton.addEventListener('click', () => {
        console.log('Apply Filters button clicked');
        try {
            console.log('All calls:', allCalls);
            let filteredCalls = [...allCalls];

            console.log('Filter selections:', {
                search: searchInput.value,
                welcomeCall: welcomeCallFilter.value,
                targetParent: targetParentFilter.value,
                interest: productInterestFilter.value
            });

            // Apply search filter
            if (searchInput.value.trim()) {
                const searchTerm = searchInput.value.trim().toLowerCase();
                filteredCalls = filteredCalls.filter(call =>
                    (call.callName || '').toLowerCase().includes(searchTerm) ||
                    (call.phoneNumber || '').toLowerCase().includes(searchTerm) ||
                    (call.callType || '').toLowerCase().includes(searchTerm)
                );
                console.log('After search filter:', filteredCalls);
            }

            // Apply welcomeCall filter
            if (welcomeCallFilter.value) {
                filteredCalls = filteredCalls.filter(call =>
                    call.welcomeCall === welcomeCallFilter.value
                );
                console.log('After welcomeCall filter:', filteredCalls);
            }

            // Apply targetParent filter
            if (targetParentFilter.value) {
                filteredCalls = filteredCalls.filter(call =>
                    call.targetParent === targetParentFilter.value
                );
                console.log('After targetParent filter:', filteredCalls);
            }

            // Apply interest filter
            if (productInterestFilter.value) {
                filteredCalls = filteredCalls.filter(call =>
                    call.interest === productInterestFilter.value
                );
                console.log('After interest filter:', filteredCalls);
            }

            console.log('Final filtered calls:', filteredCalls);
            renderTable(filteredCalls);
        } catch (error) {
            console.error('Error applying filters:', error.message);
            renderTable([]);
            updateCallCount(0);
        }
    });
}