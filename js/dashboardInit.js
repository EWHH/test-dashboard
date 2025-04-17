import { initDashboard } from './dashboard.js';
import { fetchLeads, setupEventListeners as setupLeadsEventListeners } from './leads.js';
import { fetchCallHistory, setupFilters } from './callHistory.js';

// Cache for fetched view HTML
const viewCache = {
    'leads-view': null,
    'call-history-view': null
};

function initialize() {
    const viewSelector = document.getElementById('view-selector');
    const viewContent = document.getElementById('view-content');

    console.log('Initializing dashboardInit.js');
    console.log('viewSelector:', viewSelector);
    console.log('viewContent:', viewContent);

    if (!viewSelector || !viewContent) {
        console.error('View selector or view content container not found');
        return;
    }

    async function switchView(targetViewId) {
        console.log('Switching to view:', targetViewId);

        // Hide all views
        const views = viewContent.querySelectorAll('.view-container');
        views.forEach(view => view.classList.remove('active'));

        let targetView = viewContent.querySelector(`#${targetViewId}`);
        
        if (!targetView) {
            // Fetch view if not already in DOM
            const viewFile = targetViewId === 'leads-view' ? 'leads-view.html' : 'call-history-view.html';
            let html;

            if (viewCache[targetViewId]) {
                html = viewCache[targetViewId];
            } else {
                try {
                    const response = await fetch(viewFile);
                    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                    html = await response.text();
                    viewCache[targetViewId] = html;
                } catch (err) {
                    console.error(`Failed to load ${viewFile}:`, err);
                    viewContent.innerHTML = `<h1>Error loading ${targetViewId}: ${err.message}</h1>`;
                    return;
                }
            }

            // Append new view
            viewContent.insertAdjacentHTML('beforeend', html);
            targetView = viewContent.querySelector(`#${targetViewId}`);
        }

        if (targetView) {
            targetView.classList.add('active');
        } else {
            console.error(`Target view #${targetViewId} not found after insertion`);
            return;
        }

        // Initialize view-specific logic
        requestAnimationFrame(() => {
            if (targetViewId === 'dashboard-view') {
                console.log('Initializing dashboard view');
                initDashboard();
            } else if (targetViewId === 'leads-view') {
                console.log('Initializing leads view');
                setupLeadsEventListeners();
                fetchLeads();
            } else if (targetViewId === 'call-history-view') {
                console.log('Initializing call history view');
                setupFilters();
                fetchCallHistory();
            }
        });
    }

    viewSelector.addEventListener('change', () => {
        const viewId = viewSelector.value;
        switchView(viewId);
    });

    // Set initial view
    switchView('dashboard-view');
}

// Load Chart.js dynamically
const chartScript = document.createElement('script');
chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
chartScript.onload = () => console.log('Chart.js loaded');
chartScript.onerror = () => console.error('Failed to load Chart.js');
document.head.appendChild(chartScript);

export default initialize;