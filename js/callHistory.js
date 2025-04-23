import { authState, checkResponse } from './authentication.js';

// Cache for full call list to enable client-side filtering
let allCalls = [];

console.log("callHistory.js loaded - Version with authState (2025-04-18)");

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

        renderTable(allCalls);
    } catch (error) {
        console.error('Error fetching call history:', error.message);
        renderTable([]);
        updateCallCount(0);
        allCalls = [];
    }
}

export function renderTable(calls) {
    requestAnimationFrame(() => {
        const tbody = document.querySelector('#call-history-callTable tbody');
        if (!tbody) {
            console.error('Call history table body not found');
            updateCallCount(0);
            return;
        }

        tbody.innerHTML = '';
        console.log('Rendering calls:', calls);

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

        updateCallCount(calls ? calls.length : 0);
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

function applyFilters(searchTerm, welcomeCall, targetParent, interest) {
    try {
        console.log('Applying filters with:', { searchTerm, welcomeCall, targetParent, interest });
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

        console.log('Final filtered calls:', filteredCalls);
        renderTable(filteredCalls);
    } catch (error) {
        console.error('Error applying filters:', error.message);
        renderTable([]);
        updateCallCount(0);
    }
}

export function setupFilters() {
    requestAnimationFrame(() => {
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

        // Cache current filter values
        let currentFilters = {
            welcomeCall: welcomeCallFilter.value,
            targetParent: targetParentFilter.value,
            interest: productInterestFilter.value
        };

        // Update filter cache when dropdowns change
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

        // Search as user types
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim();
            console.log('Search input changed:', searchTerm);
            applyFilters(searchTerm, currentFilters.welcomeCall, currentFilters.targetParent, currentFilters.interest);
        });

        // Apply dropdown filters on button click
        applyFiltersButton.addEventListener('click', () => {
            console.log('Apply Filters button clicked');
            const searchTerm = searchInput.value.trim();
            applyFilters(searchTerm, currentFilters.welcomeCall, currentFilters.targetParent, currentFilters.interest);
        });
    });
}