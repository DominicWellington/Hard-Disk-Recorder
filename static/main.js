
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
  
  // Validate step 1 fields
  const branch = document.getElementById('branch').value;
  const startDate = document.getElementById('start_date').value;
  const endDate = document.getElementById('end_date').value;
  const drive1 = document.getElementById('drive1').value;
  const drive2 = document.getElementById('drive2').value;
  
  if (!branch || !startDate || !endDate || !drive1) {
    alert('Please fill in all required fields before proceeding');
    return;
  }
  
  step1.classList.remove('active');
  step2.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep() {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  
  step2.classList.remove('active');
  step1.classList.add('active');
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

function applyFilters() {
  const branchFilter = document.getElementById('filter-branch').value.toLowerCase();
  const drive1Filter = document.getElementById('filter-drive1').value.toLowerCase();
  const drive2Filter = document.getElementById('filter-drive2').value.toLowerCase();
  const startDateFilter = document.getElementById('filter-start').value;
  const endDateFilter = document.getElementById('filter-end').value;
  
  const rows = document.querySelectorAll('.reports-table tbody tr');
  
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
  
  let visibleCount = 0;
  
  rows.forEach(row => {
    // Skip "no data" row
    if (row.querySelector('.no-data')) return;
    
    const cells = row.querySelectorAll('td');
    const branch = cells[1].textContent.toLowerCase().trim();
    const startDate = cells[2].textContent.trim();
    const drive1 = cells[4].textContent.toLowerCase().trim();
    const drive2 = cells[5].textContent.toLowerCase().trim();
    
    let showRow = true;
    
    // Filter by branch
    if (branchFilter && !branch.includes(branchFilter)) {
      showRow = false;
    }
    
    // Filter by drive1
    if (drive1Filter && !drive1.includes(drive1Filter)) {
      showRow = false;
    }
    
    // Filter by drive2
    if (drive2Filter && !drive2.includes(drive2Filter)) {
      showRow = false;
    }
    
    // Filter by date range
    if (startDateFilter && startDate < startDateFilter) {
      showRow = false;
    }
    
    if (endDateFilter && startDate > endDateFilter) {
      showRow = false;
    }
    
    row.style.display = showRow ? '' : 'none';
    if (showRow) visibleCount++;
  });
  
  // Close filter menu and overlay after applying filters
  document.getElementById('filter-menu').classList.remove('active');
  document.getElementById('filter-overlay').classList.remove('active');
  
  // Show notification with results
  console.log(`Found ${visibleCount} matching records out of ${rows.length - 1} total`);
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
  
  // Show all rows
  const rows = document.querySelectorAll('.reports-table tbody tr');
  rows.forEach(row => {
    row.style.display = '';
  });
  
  // Close filter menu and overlay
  document.getElementById('filter-menu').classList.remove('active');
  document.getElementById('filter-overlay').classList.remove('active');
}
