/**
 * app.js - DOM Manipulation, Filtering, and State Management
 */
import { fetchSystemAlerts } from './api.js';

// Application State
let alertsData = [];
const STORAGE_KEY = 'dashboard_preferred_filter';

// Elements
const tableBody = document.querySelector('tbody');
const formSection = document.querySelector('section[aria-labelledby="table-heading"]');

// Inject Search UI
function injectFilterControls() {
  const filterContainer = document.createElement('div');
  filterContainer.style.margin = '1rem 0';
  filterContainer.style.display = 'flex';
  filterContainer.style.gap = '1rem';
  filterContainer.style.flexWrap = 'wrap';

  filterContainer.innerHTML = `
    <label for="search-input" style="font-weight: bold;">Search Incidents:</label>
    <input type="text" id="search-input" placeholder="Type to filter..." style="max-width: 250px;">
    <select id="status-filter">
      <option value="all">All Incidents</option>
      <option value="completed">Resolved</option>
      <option value="pending">Degraded / Pending</option>
    </select>
  `;

  const table = formSection.querySelector('table');
  formSection.insertBefore(filterContainer, table);
}

// Render data rows to the table
function renderRows(items) {
  tableBody.innerHTML = '';

  if (items.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 1rem;">No matching incidents found.</td></tr>`;
    return;
  }

  items.forEach(item => {
    const row = document.createElement('tr');
    const statusText = item.completed ? 'Resolved' : 'Degraded';
    const statusColor = item.completed ? '#10b981' : '#ef4444';

    row.innerHTML = `
      <th scope="row">INC-${item.id}</th>
      <td>${item.title}</td>
      <td style="color: ${statusColor}; font-weight: bold;">${statusText}</td>
      <td><button type="button" aria-label="Acknowledge alert INC-${item.id}">Review</button></td>
    `;
    tableBody.appendChild(row);
  });
}

// Filter logic
function applyFilters() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const filterType = document.getElementById('status-filter').value;

  // Save selection in localStorage
  localStorage.setItem(STORAGE_KEY, filterType);

  const filtered = alertsData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm);
    if (filterType === 'completed') return matchesSearch && item.completed;
    if (filterType === 'pending') return matchesSearch && !item.completed;
    return matchesSearch;
  });

  renderRows(filtered);
}

// Initialize Application
async function init() {
  injectFilterControls();

  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');

  // Restore saved filter from localStorage
  const savedFilter = localStorage.getItem(STORAGE_KEY);
  if (savedFilter) {
    statusFilter.value = savedFilter;
  }

  // Show Loading Skeleton State
  tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 1.5rem;">Loading live operational data...</td></tr>`;

  try {
    alertsData = await fetchSystemAlerts();
    applyFilters();
  } catch (err) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="color: var(--color-danger, #ef4444); text-align: center; padding: 1.5rem;">
          Failed to load live status data. Please verify network connectivity.
        </td>
      </tr>`;
  }

  // Event Listeners for Real-time Search
  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
}

document.addEventListener('DOMContentLoaded', init);
