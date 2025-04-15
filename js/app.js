/* import { initDashboard } from './dashboard.js';
import { fetchLeads } from './leads.js';

window.addEventListener('DOMContentLoaded', () => {
  const dashboardBtn = document.querySelector('[data-view="dashboard"]');
  const leadsBtn = document.querySelector('[data-view="leads"]');
  const callsBtn = document.querySelector('[data-view="calls"]');

  const dashboardView = document.getElementById('dashboardView');
  const leadsView = document.getElementById('leadsView');
  const callsView = document.getElementById('callsView');

  function showView(viewToShow) {
    dashboardView.style.display = 'none';
    leadsView.style.display = 'none';
    callsView.style.display = 'none';

    viewToShow.style.display = 'block';
  }

  dashboardBtn.addEventListener('click', () => {
    showView(dashboardView);
    initDashboard();
  });

  leadsBtn.addEventListener('click', () => {
    showView(leadsView);
    fetchLeads(); // renamed from initLeads() to match your leads.js
  });

  callsBtn.addEventListener('click', () => {
    showView(callsView);
    // Future: initCalls(); if you have a function for that
  });

  // Show dashboard by default on load
  showView(dashboardView);
  initDashboard();
}); */





/* const views = {
    dashboard: document.getElementById('dashboardView'),
    leads: document.getElementById('leadsView'),
    calls: document.getElementById('callsView'),
  };
  
  document.querySelectorAll('.navbar button').forEach(btn => {
    btn.addEventListener('click', async () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });
  
  function switchView(activeView) {
    Object.entries(views).forEach(([key, section]) => {
      section.style.display = key === activeView ? 'block' : 'none';
    });
  
    if (activeView === 'dashboard' && !views.dashboard.hasChildNodes()) {
      import('./dashboard.js').then(mod => mod.initDashboard(views.dashboard));
    }
  
    if (activeView === 'leads' && !views.leads.hasChildNodes()) {
      import('./leads.js').then(mod => mod.initLeads(views.leads));
    }
  
    if (activeView === 'calls' && !views.calls.hasChildNodes()) {
      import('./calls.js').then(mod => mod.initCalls(views.calls));
    }
  }
  
  // Load dashboard by default
  switchView('dashboard'); */