/**
 * HUNTER Members Dashboard - Premium JavaScript
 * View-only dashboard for displaying team members
 * Advanced search, filtering, and premium animations
 * Author: MiniMax Agent
 */

class HunterDashboard {
    constructor() {
        this.hunters = [];
        this.filteredHunters = [];
        this.currentGroupFilter = '';
        this.currentSearch = '';
        this.currentSort = 'id';
        this.currentSortDirection = 'asc';
        this.currentView = 'bar';
        
        // DOM elements
        this.elements = {
            totalCount: document.getElementById('total-count'),
            huntersGrid: document.getElementById('hunters-grid'),
            huntersTable: document.getElementById('hunters-table'),
            huntersTbody: document.getElementById('hunters-tbody'),
            searchInput: document.getElementById('search-input'),
            groupFilter: document.getElementById('group-filter'),
            noResults: document.getElementById('no-results'),
            loading: document.getElementById('loading'),
            
            // View toggle buttons
            barView: document.getElementById('bar-view'),
            tableView: document.getElementById('table-view'),
            
            // Sort buttons
            sortName: document.getElementById('sort-name'),
            sortDate: document.getElementById('sort-date'),
            
            // Table headers
            tableHeaders: document.querySelectorAll('.table-header th')
        };
        
        this.init();
    }
    
    /**
     * Initialize the dashboard
     */
    async init() {
        try {
            await this.loadHunters();
            this.setupEventListeners();
            this.populateGroupFilter();
            this.setView('bar'); // Set default view
            this.updateSortButtonStates(); // Initialize sort buttons
            this.filterAndRender();
            this.updateTotalCount();
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showError('Failed to load hunter data. Please check the data file.');
        }
    }
    
    /**
     * Update sort button visual states
     */
    updateSortButtonStates() {
        this.elements.sortName.classList.toggle('active', this.currentSort === 'name');
        this.elements.sortDate.classList.toggle('active', this.currentSort === 'date');
        this.updateTableHeaderStates();
    }
    
    /**
     * Load hunters data from JSON file
     */
    async loadHunters() {
        try {
            const response = await fetch('./data/hunters.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.hunters = await response.json();
            this.filteredHunters = [...this.hunters];
        } catch (error) {
            console.error('Error loading hunters data:', error);
            throw error;
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search input
        this.elements.searchInput.addEventListener('input', 
            this.debounce((e) => {
                this.currentSearch = e.target.value.trim().toLowerCase();
                this.filterAndRender();
            }, 300)
        );
        
        // Group filter
        this.elements.groupFilter.addEventListener('change', (e) => {
            this.currentGroupFilter = e.target.value;
            this.filterAndRender();
        });
        
        // View toggle
        this.elements.barView.addEventListener('click', () => {
            this.setView('bar');
        });
        
        this.elements.tableView.addEventListener('click', () => {
            this.setView('table');
        });
        
        // Sort buttons
        this.elements.sortName.addEventListener('click', () => {
            this.toggleSort('name');
        });
        
        this.elements.sortDate.addEventListener('click', () => {
            this.toggleSort('date');
        });
        
        // Table header sorting
        this.elements.tableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortField = header.dataset.sort;
                if (sortField) {
                    this.toggleSort(sortField);
                }
            });
        });
    }
    
    /**
     * Populate group filter dropdown
     */
    populateGroupFilter() {
        const groups = [...new Set(this.hunters.map(hunter => hunter.group))]
            .sort()
            .filter(group => group);
            
        this.elements.groupFilter.innerHTML = '<option value="">All Groups</option>';
        
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            this.elements.groupFilter.appendChild(option);
        });
    }
    
    /**
     * Filter and render hunters based on current search and group filter
     */
    filterAndRender() {
        this.filteredHunters = this.hunters.filter(hunter => {
            const matchesSearch = this.currentSearch === '' || 
                hunter.name.toLowerCase().includes(this.currentSearch) ||
                hunter.id.toLowerCase().includes(this.currentSearch);
                
            const matchesGroup = this.currentGroupFilter === '' || 
                hunter.group === this.currentGroupFilter;
                
            return matchesSearch && matchesGroup;
        });
        
        this.sortHunters();
        this.renderHunters();
    }
    
    /**
     * Set current view (bar or table)
     */
    setView(view) {
        this.currentView = view;
        
        // Update button states
        this.elements.barView.classList.toggle('active', view === 'bar');
        this.elements.tableView.classList.toggle('active', view === 'table');
        
        // Show/hide views
        this.elements.huntersGrid.style.display = view === 'bar' ? 'flex' : 'none';
        this.elements.huntersTable.style.display = view === 'table' ? 'block' : 'none';
        
        // Re-render with current view
        this.renderHunters();
    }
    
    /**
     * Toggle sort by field
     */
    toggleSort(field) {
        if (this.currentSort === field) {
            // Toggle direction
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // New sort field
            this.currentSort = field;
            this.currentSortDirection = 'asc';
        }
        
        // Update sort button states
        this.elements.sortName.classList.toggle('active', this.currentSort === 'name');
        this.elements.sortDate.classList.toggle('active', this.currentSort === 'date');
        
        // Update table header states
        this.updateTableHeaderStates();
        
        // Re-sort and re-render
        this.sortHunters();
        this.renderHunters();
    }
    
    /**
     * Update table header visual states
     */
    updateTableHeaderStates() {
        this.elements.tableHeaders.forEach(header => {
            const sortField = header.dataset.sort;
            header.classList.remove('sorted', 'asc', 'desc');
            
            if (sortField === this.currentSort) {
                header.classList.add('sorted', this.currentSortDirection);
            }
        });
    }
    
    /**
     * Sort hunters based on current sort settings
     */
    sortHunters() {
        this.filteredHunters.sort((a, b) => {
            let valueA, valueB;
            
            switch (this.currentSort) {
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'date':
                    valueA = new Date(a.join_date);
                    valueB = new Date(b.join_date);
                    break;
                case 'id':
                default:
                    valueA = a.id;
                    valueB = b.id;
                    break;
            }
            
            if (valueA < valueB) {
                return this.currentSortDirection === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return this.currentSortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    
    /**
     * Render hunters to the current view
     */
    renderHunters() {
        if (this.filteredHunters.length === 0) {
            this.showNoResults();
            return;
        }
        
        this.hideNoResults();
        
        if (this.currentView === 'bar') {
            this.renderBarView();
        } else {
            this.renderTableView();
        }
    }
    
    /**
     * Render hunters in bar view (horizontal list)
     */
    renderBarView() {
        const grid = this.elements.huntersGrid;
        grid.innerHTML = '';
        
        this.filteredHunters.forEach(hunter => {
            const bar = this.createHunterBar(hunter);
            grid.appendChild(bar);
        });
    }
    
    /**
     * Render hunters in table view
     */
    renderTableView() {
        const tbody = this.elements.huntersTbody;
        tbody.innerHTML = '';
        
        this.filteredHunters.forEach(hunter => {
            const row = this.createHunterTableRow(hunter);
            tbody.appendChild(row);
        });
    }
    
    /**
     * Create a hunter table row element
     */
    createHunterTableRow(hunter) {
        const row = document.createElement('tr');
        row.className = `table-row ${hunter.status.toLowerCase() === 'inactive' ? 'inactive' : ''}`;
        
        const formattedDate = this.formatDate(hunter.join_date);
        const statusClass = hunter.status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
        
        row.innerHTML = `
            <td class="table-td id-cell">${this.escapeHtml(hunter.id)}</td>
            <td class="table-td name-cell">${this.escapeHtml(hunter.name)}</td>
            <td class="table-td category-cell">
                <span class="group-tag">${this.escapeHtml(hunter.group)}</span>
            </td>
            <td class="table-td status-cell">
                <span class="status-badge ${statusClass}">
                    <span class="status-dot"></span>
                    ${this.escapeHtml(hunter.status)}
                </span>
            </td>
            <td class="table-td date-cell">${formattedDate}</td>
        `;
        
        return row;
    }
    
    /**
     * Create a hunter bar element with premium animations
     */
    createHunterBar(hunter) {
        const bar = document.createElement('div');
        bar.className = `hunter-bar ${hunter.status.toLowerCase() === 'inactive' ? 'inactive' : ''}`;
        bar.style.opacity = '0';
        bar.style.transform = 'translateX(-20px)';
        
        const statusClass = hunter.status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
        const formattedDate = this.formatDate(hunter.join_date);
        const memberSince = this.getMemberSince(hunter.join_date);
        
        bar.innerHTML = `
            <!-- ID Section -->
            <div class="hunter-section id-section">
                <div class="section-label">ID</div>
                <div class="id-value">${this.escapeHtml(hunter.id)}</div>
            </div>
            
            <!-- Name Section -->
            <div class="hunter-section name-section">
                <div class="section-label">Name</div>
                <div class="name-value">${this.escapeHtml(hunter.name)}</div>
            </div>
            
            <!-- Category Section -->
            <div class="hunter-section category-section">
                <div class="section-label">Category</div>
                <div class="category-value">
                    <span class="group-tag">${this.escapeHtml(hunter.group)}</span>
                </div>
            </div>
            
            <!-- Status Section -->
            <div class="hunter-section status-section">
                <div class="section-label">Status</div>
                <div class="status-value">
                    <span class="status-badge ${statusClass}">
                        <span class="status-dot"></span>
                        ${this.escapeHtml(hunter.status)}
                    </span>
                </div>
            </div>
            
            <!-- Date Section -->
            <div class="hunter-section date-section">
                <div class="section-label">Date</div>
                <div class="date-value">${formattedDate}</div>
                <div class="member-since-value">${memberSince}</div>
            </div>
        `;
        
        // Animate bar entrance
        requestAnimationFrame(() => {
            setTimeout(() => {
                bar.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                bar.style.opacity = '1';
                bar.style.transform = 'translateX(0)';
            }, Math.random() * 150);
        });
        
        return bar;
    }
    
    /**
     * Update total count display
     */
    updateTotalCount() {
        this.elements.totalCount.textContent = this.hunters.length;
    }
    
    /**
     * Show no results message
     */
    showNoResults() {
        this.elements.huntersGrid.style.display = 'none';
        this.elements.noResults.style.display = 'flex';
    }
    
    /**
     * Hide no results message
     */
    hideNoResults() {
        this.elements.huntersGrid.style.display = 'grid';
        this.elements.noResults.style.display = 'none';
    }
    
    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.elements.loading.style.display = 'none';
    }
    
    /**
     * Show error message
     */
    showError(message) {
        this.hideLoading();
        this.elements.huntersGrid.innerHTML = `
            <div class="error-message" style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 2rem;
                background: var(--danger-bg);
                border: 1px solid var(--danger-color);
                border-radius: var(--radius-lg);
                color: var(--danger-color);
            ">
                <h3>Error Loading Data</h3>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
    }
    
    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }
    
    /**
     * Calculate member since text
     */
    getMemberSince(dateString) {
        if (!dateString) return '';
        
        try {
            const joinDate = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - joinDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 30) {
                return `(${diffDays} days ago)`;
            } else if (diffDays < 365) {
                const months = Math.floor(diffDays / 30);
                return `(${months} month${months > 1 ? 's' : ''} ago)`;
            } else {
                const years = Math.floor(diffDays / 365);
                return `(${years} year${years > 1 ? 's' : ''} ago)`;
            }
        } catch (error) {
            return '';
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Debounce function to limit API calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Get statistics about hunters
     */
    getStatistics() {
        const stats = {
            total: this.hunters.length,
            active: this.hunters.filter(h => h.status.toLowerCase() === 'active').length,
            inactive: this.hunters.filter(h => h.status.toLowerCase() !== 'active').length,
            groups: [...new Set(this.hunters.map(h => h.group))].length
        };
        
        return stats;
    }
    
    /**
     * Export filtered data (for potential future use)
     */
    exportFilteredData() {
        const data = {
            hunters: this.filteredHunters,
            filters: {
                search: this.currentSearch,
                group: this.currentGroupFilter
            },
            statistics: this.getStatistics(),
            exportDate: new Date().toISOString()
        };
        
        return data;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global dashboard instance
    window.hunterDashboard = new HunterDashboard();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Focus search with Ctrl+F or Cmd+F
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
        
        // Switch to bar view with Ctrl+1
        if ((e.ctrlKey || e.metaKey) && e.key === '1') {
            e.preventDefault();
            window.hunterDashboard.setView('bar');
        }
        
        // Switch to table view with Ctrl+2
        if ((e.ctrlKey || e.metaKey) && e.key === '2') {
            e.preventDefault();
            window.hunterDashboard.setView('table');
        }
        
        // Clear search with Escape
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('search-input');
            if (document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
            }
        }
    });
    
    // Add window resize handler for responsive adjustments
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Trigger any responsive layout updates if needed
            if (window.hunterDashboard) {
                window.hunterDashboard.renderHunters();
            }
        }, 250);
    });
});

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
    console.error('Uncaught error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});