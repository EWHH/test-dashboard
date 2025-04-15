import { loginAndStoreToken, getCookie } from "./authentication.js";

async function fetchLeads() {
  try {
    // Login with hardcoded credentials
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

    const tbody = document.querySelector('#leadsTable tbody');
    tbody.innerHTML = ''; // Clear previous rows

    leads.forEach(lead => {
      const row = document.createElement('tr');
      const createdAtDate = new Date(lead.created_at);
      const formattedDate = createdAtDate.toLocaleString();

      row.innerHTML = `
        <td>${lead.id}</td>
        <td>${lead.clientName}</td>
        <td>${lead.email}</td>
        <td>${lead.address}</td>
        <td>${lead.contactNumber}</td>
        <td class="${lead.called ? 'status-true' : 'status-false'}">${lead.called}</td>
        <td class="${lead.toCall ? 'status-true' : 'status-false'}">${lead.toCall}</td>
        <td>${formattedDate}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error('Failed to fetch leads:', err);
  }
}

const overlay = document.getElementById('overlay');
const popup = document.getElementById('popupForm');

function showPopup() {
  popup.style.display = 'block';
  overlay.style.display = 'block';
}

function hidePopup() {
  popup.style.display = 'none';
  overlay.style.display = 'none';
}

const leadOptions = document.getElementById('leadOptions');
const fileInput = document.getElementById('bulkFileInput');

function showLeadOptions() {
  overlay.style.display = 'block';
  leadOptions.style.display = 'block';
}

function hideLeadOptions() {
  overlay.style.display = 'none';
  leadOptions.style.display = 'none';
}

// Button actions
document.getElementById('addLeadBtn').addEventListener('click', showLeadOptions);
document.getElementById('cancelLeadOptionBtn').addEventListener('click', hideLeadOptions);
overlay.addEventListener('click', () => {
  hidePopup();
  hideLeadOptions();
});

document.getElementById('singleLeadBtn').addEventListener('click', () => {
  hideLeadOptions();
  showPopup();
});

document.getElementById('bulkLeadBtn').addEventListener('click', () => {
  fileInput.click();
});

// Parse and upload CSV
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
      fileInput.value = ''; // reset file input
    }
  };

  reader.readAsText(file);
});

document.getElementById('cancelBtn').addEventListener('click', hidePopup);

document.getElementById('leadForm').addEventListener('submit', async (e) => {
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
    fetchLeads(); // Reload the table
  } catch (err) {
    console.error('Error adding lead:', err);
    alert(`Failed to add lead: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});

// Auto-run on page load
window.onload = fetchLeads;
