
// Toggle between login and signup forms
function toggleForm() {
  document.getElementById("login-box").classList.toggle("hidden");
  document.getElementById("signup-box").classList.toggle("hidden");
}

// Custom Dropdown for Branches
document.addEventListener('DOMContentLoaded', function() {
  const branchInput = document.getElementById('branch');
  const dropdown = document.getElementById('branch-dropdown');
  
  if (branchInput && dropdown) {
    const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
    
    // Show dropdown on focus
    branchInput.addEventListener('focus', function() {
      dropdown.classList.add('active');
      filterDropdown('');
    });
    
    // Filter dropdown on input
    branchInput.addEventListener('input', function() {
      const searchTerm = this.value.toUpperCase();
      filterDropdown(searchTerm);
      dropdown.classList.add('active');
    });
    
    // Select item on click
    dropdownItems.forEach(item => {
      item.addEventListener('click', function() {
        branchInput.value = this.getAttribute('data-value');
        dropdown.classList.remove('active');
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!branchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
    
    // Filter function
    function filterDropdown(searchTerm) {
      dropdownItems.forEach(item => {
        const text = item.getAttribute('data-value');
        if (text.includes(searchTerm)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    }
  }
});

// Multi-Step Form Navigation
function nextStep() {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const stepIndicator1 = document.getElementById('step-indicator-1');
  const stepIndicator2 = document.getElementById('step-indicator-2');
  
  // Validate step 1 fields
  const branch = document.getElementById('branch').value;
  const startDate = document.getElementById('start_date').value;
  const endDate = document.getElementById('end_date').value;
  const drive1 = document.getElementById('drive1').value;
  
  if (!branch || !startDate || !endDate || !drive1) {
    alert('Please fill in all required fields before proceeding');
    return;
  }
  
  step1.classList.remove('active');
  step2.classList.add('active');
  
  // Update step indicators
  stepIndicator1.classList.remove('active');
  stepIndicator1.classList.add('completed');
  stepIndicator2.classList.add('active');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep() {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const stepIndicator1 = document.getElementById('step-indicator-1');
  const stepIndicator2 = document.getElementById('step-indicator-2');
  
  step2.classList.remove('active');
  step1.classList.add('active');
  
  // Update step indicators
  stepIndicator1.classList.remove('completed');
  stepIndicator1.classList.add('active');
  stepIndicator2.classList.remove('active');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Filter functionality
function toggleFilter() {
  const filterMenu = document.getElementById('filter-menu');
  const filterOverlay = document.getElementById('filter-overlay');
  
  filterMenu.classList.toggle('active');
  filterOverlay.classList.toggle('active');
}

// Close filter menu when clicking outside
document.addEventListener('click', function(e) {
  const filterDropdown = document.querySelector('.filter-dropdown');
  const filterMenu = document.getElementById('filter-menu');
  const filterOverlay = document.getElementById('filter-overlay');
  
  if (filterDropdown && filterMenu && filterOverlay && 
      !filterDropdown.contains(e.target) && 
      !filterMenu.contains(e.target)) {
    filterMenu.classList.remove('active');
    filterOverlay.classList.remove('active');
  }
});

// Pagination variables
let currentPage = 1;
let recordsPerPage = 5;
let allRows = [];
let filteredRows = [];

// Initialize pagination when page loads
document.addEventListener('DOMContentLoaded', function() {
  initializePagination();
});

function initializePagination() {
  const tbody = document.getElementById('reports-tbody');
  if (!tbody) return;
  
  allRows = Array.from(tbody.querySelectorAll('tr'));
  // Filter out "no data" rows
  allRows = allRows.filter(row => !row.querySelector('.no-data'));
  filteredRows = [...allRows];
  
  // Update total records count
  const totalRecordsElement = document.getElementById('total-records');
  if (totalRecordsElement) {
    totalRecordsElement.textContent = allRows.length;
  }
  
  // Only show pagination if we have data
  if (allRows.length > 0) {
    updatePagination();
  }
}

function updatePagination() {
  const totalRecords = filteredRows.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  // Update pagination info
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);
  
  const startRecordElement = document.getElementById('start-record');
  const endRecordElement = document.getElementById('end-record');
  const totalRecordsElement = document.getElementById('total-records');
  
  if (startRecordElement) startRecordElement.textContent = startRecord;
  if (endRecordElement) endRecordElement.textContent = endRecord;
  if (totalRecordsElement) totalRecordsElement.textContent = totalRecords;
  
  // Update current page display
  updateCurrentPageDisplay(totalPages);
  
  // Show/hide rows
  showCurrentPageRows();
  
  // Show/hide pagination container based on whether we need pagination
  const paginationContainer = document.querySelector('.pagination-container');
  if (paginationContainer) {
    paginationContainer.style.display = totalPages > 1 ? 'flex' : 'flex';
  }
}

function updateCurrentPageDisplay(totalPages) {
  const currentPageElement = document.getElementById('current-page');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  if (currentPageElement) {
    currentPageElement.textContent = currentPage;
  }
  
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  }
}

function previousPage() {
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredRows.length / recordsPerPage);
  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
}

function showCurrentPageRows() {
  const tbody = document.getElementById('reports-tbody');
  if (!tbody) return;
  
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  
  // Hide all rows first
  allRows.forEach(row => {
    row.style.display = 'none';
  });
  
  // Show only current page rows from filtered results
  const rowsToShow = filteredRows.slice(startIndex, endIndex);
  rowsToShow.forEach(row => {
    row.style.display = '';
  });
  
  // If no rows to show and we have a "no data" row, show it
  if (rowsToShow.length === 0 && filteredRows.length === 0) {
    const noDataRow = tbody.querySelector('.no-data');
    if (noDataRow && noDataRow.parentElement) {
      noDataRow.parentElement.style.display = '';
    }
  }
}

function goToPage(pageNum) {
  currentPage = pageNum;
  updatePagination();
}

// Update the existing applyFilters function to work with pagination
function applyFilters() {
  const branchFilter = document.getElementById('filter-branch').value.toLowerCase();
  const drive1Filter = document.getElementById('filter-drive1').value.toLowerCase();
  const drive2Filter = document.getElementById('filter-drive2').value.toLowerCase();
  const startDateFilter = document.getElementById('filter-start').value;
  const endDateFilter = document.getElementById('filter-end').value;
  
  // Count active filters
  let activeFilters = 0;
  if (branchFilter) activeFilters++;
  if (drive1Filter) activeFilters++;
  if (drive2Filter) activeFilters++;
  if (startDateFilter) activeFilters++;
  if (endDateFilter) activeFilters++;
  
  // Update filter count badge
  const filterCount = document.getElementById('filter-count');
  if (activeFilters > 0) {
    filterCount.textContent = activeFilters;
    filterCount.style.display = 'inline-flex';
  } else {
    filterCount.style.display = 'none';
  }
  
  // Filter rows
  filteredRows = allRows.filter(row => {
    // Skip "no data" row
    if (row.querySelector('.no-data')) return false;
    
    const cells = row.querySelectorAll('td');
    const branch = cells[1].textContent.toLowerCase().trim();
    const startDate = cells[2].textContent.trim();
    const drive1 = cells[4].textContent.toLowerCase().trim();
    const drive2 = cells[5].textContent.toLowerCase().trim();
    
    // Apply filters
    if (branchFilter && !branch.includes(branchFilter)) return false;
    if (drive1Filter && !drive1.includes(drive1Filter)) return false;
    if (drive2Filter && !drive2.includes(drive2Filter)) return false;
    if (startDateFilter && startDate < startDateFilter) return false;
    if (endDateFilter && startDate > endDateFilter) return false;
    
    return true;
  });
  
  // Reset to first page and update pagination
  currentPage = 1;
  updatePagination();
  
  // Close filter menu and overlay
  document.getElementById('filter-menu').classList.remove('active');
  document.getElementById('filter-overlay').classList.remove('active');
}

function clearFilters() {
  document.getElementById('filter-branch').value = '';
  document.getElementById('filter-drive1').value = '';
  document.getElementById('filter-drive2').value = '';
  document.getElementById('filter-start').value = '';
  document.getElementById('filter-end').value = '';
  
  // Hide filter count badge
  const filterCount = document.getElementById('filter-count');
  filterCount.style.display = 'none';
  
  // Reset filtered rows to all rows
  filteredRows = [...allRows];
  
  // Reset to first page and update pagination
  currentPage = 1;
  updatePagination();
  
  // Close filter menu and overlay
  document.getElementById('filter-menu').classList.remove('active');
  document.getElementById('filter-overlay').classList.remove('active');
}

// Edit report function
function editReport(reportId) {
  window.location.href = `/edit-report/${reportId}`;
}
