/**
 * HUNTER Members Dashboard - Premium JavaScript
 * View-only dashboard for displaying team members
 * Advanced search, filtering, premium animations, and member ID modal
 * Author: MiniMax Agent
 */

class HunterDashboard {
    constructor() {
        this.hunters = [];
        this.filteredHunters = [];
        this.registrations = {}; // Store registration data
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
            this.setView('bar');
            this.updateSortButtonStates();
            this.filterAndRender();
            this.updateTotalCount();
            this.hideLoading();

        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showError('Failed to load hunter data. Please check the data file.');
        }
    }
    
    /**
     * Load hunters and registration data
     */
    async loadHunters() {
        try {
            const [okto, mio] = await Promise.all([
                fetch('./data/hunters-okto88.json').then(r => {
                    if (!r.ok) throw new Error('Failed to load OKTO88 data');
                    return r.json();
                }),
                fetch('./data/hunters-mio88.json').then(r => {
                    if (!r.ok) throw new Error('Failed to load MIO88 data');
                    return r.json();
                })
            ]);

            const oktoWithGroup = okto.map(h => ({ ...h, group: 'OKTO88' }));
            const mioWithGroup = mio.map(h => ({ ...h, group: 'MIO88' }));

            this.hunters = [...oktoWithGroup, ...mioWithGroup];
            this.filteredHunters = [...this.hunters];

            // Load registrations
            const regRes = await fetch('./data/registrations-mio88.json');
            if (regRes.ok) {
                this.registrations = await regRes.json();
            }
        } catch (error) {
            console.error('Error loading hunters ', error);
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
        this.elements.barView.addEventListener('click', () => this.setView('bar'));
        this.elements.tableView.addEventListener('click', () => this.setView('table'));
        
        // Sort buttons
        this.elements.sortName.addEventListener('click', () => this.toggleSort('name'));
        this.elements.sortDate.addEventListener('click', () => this.toggleSort('date'));
        
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
     * Filter and render hunters
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
        this.elements.barView.classList.toggle('active', view === 'bar');
        this.elements.tableView.classList.toggle('active', view === 'table');
        this.elements.huntersGrid.style.display = view === 'bar' ? 'flex' : 'none';
        this.elements.huntersTable.style.display = view === 'table' ? 'block' : 'none';
        this.renderHunters();
    }
    
    /**
     * Toggle sort by field
     */
    toggleSort(field) {
        if (this.currentSort === field) {
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort = field;
            this.currentSortDirection = 'asc';
        }
        this.updateSortButtonStates();
        this.sortHunters();
        this.renderHunters();
    }
    
    /**
     * Update sort button and table header states
     */
    updateSortButtonStates() {
        this.elements.sortName.classList.toggle('active', this.currentSort === 'name');
        this.elements.sortDate.classList.toggle('active', this.currentSort === 'date');
        this.updateTableHeaderStates();
    }
    
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
     * Sort hunters
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
            
            if (valueA < valueB) return this.currentSortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.currentSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    /**
     * Render hunters based on current view
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
     * Render bar view
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
     * Render table view
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
     * Create table row
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
     * Create hunter bar with click-to-open modal
     */
    createHunterBar(hunter) {
        const bar = document.createElement('div');
        bar.className = `hunter-bar ${hunter.status.toLowerCase() === 'inactive' ? 'inactive' : ''}`;
        bar.style.opacity = '0';
        bar.style.transform = 'translateX(-20px)';
        
        // ✅ Tambahkan dataset untuk identifikasi
        bar.dataset.hunterId = hunter.id;

        const levelBadge = hunter.level
            ? `<span class="level-badge ${hunter.level.toLowerCase()}">${this.escapeHtml(hunter.level)}</span>`
            : '';

        const statusClass = hunter.status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
        const formattedDate = this.formatDate(hunter.join_date);
        const memberSince = this.getMemberSince(hunter.join_date);
        
        bar.innerHTML = `
            <div class="hunter-section id-section">
                <div class="section-label">ID</div>
                <div class="id-value">${this.escapeHtml(hunter.id)}</div>
            </div>
            <div class="hunter-section name-section">
                <div class="section-label">Name</div>
                <div class="name-value clickable">
                    ${this.escapeHtml(hunter.name)} ${levelBadge}
                </div>
            </div>
            <div class="hunter-section category-section">
                <div class="section-label">Category</div>
                <div class="category-value">
                    <span class="group-tag">${this.escapeHtml(hunter.group)}</span>
                </div>
            </div>
            <div class="hunter-section status-section">
                <div class="section-label">Status</div>
                <div class="status-value">
                    <span class="status-badge ${statusClass}">
                        <span class="status-dot"></span>
                        ${this.escapeHtml(hunter.status)}
                    </span>
                </div>
            </div>
            <div class="hunter-section date-section">
                <div class="section-label">Date</div>
                <div class="date-value">${formattedDate}</div>
                <div class="member-since-value">${memberSince}</div>
            </div>
        `;

        // ❌ HAPUS: event listener langsung di sini (karena pakai delegation)

        // Animate entrance
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
     * Open modal to show registered IDs for a hunter
     */
    openMemberModal(hunter) {
        const ids = this.registrations?.[hunter.id] || [];
        const displayedLevel = hunter.level || 'N/A';

        let modal = document.getElementById('member-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'member-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal">
                <h2>${this.escapeHtml(hunter.name)} (${this.escapeHtml(displayedLevel)})</h2>
                <p>Total ID: <b>${ids.length}</b></p>
                <ul class="id-list">
                    ${ids.map(id => `<li>${this.escapeHtml(id)}</li>`).join('')}
                </ul>
                <button class="modal-close">Close</button>
            </div>
        `;

        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.onclick = () => modal.remove();
        }

        // Close modal when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    /**
     * Update total count
     */
    updateTotalCount() {
        this.elements.totalCount.textContent = this.hunters.length;
    }
    
    showNoResults() {
        this.elements.huntersGrid.style.display = 'none';
        this.elements.noResults.style.display = 'flex';
    }
    
    hideNoResults() {
        this.elements.huntersGrid.style.display = 'flex';
        this.elements.noResults.style.display = 'none';
    }
    
    hideLoading() {
        this.elements.loading.style.display = 'none';
    }
    
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
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    getStatistics() {
        const stats = {
            total: this.hunters.length,
            active: this.hunters.filter(h => h.status.toLowerCase() === 'active').length,
            inactive: this.hunters.filter(h => h.status.toLowerCase() !== 'active').length,
            groups: [...new Set(this.hunters.map(h => h.group))].length
        };
        return stats;
    }
    
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.hunterDashboard = new HunterDashboard();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('search-input')?.focus();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '1') {
            e.preventDefault();
            window.hunterDashboard?.setView('bar');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '2') {
            e.preventDefault();
            window.hunterDashboard?.setView('table');
        }
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('search-input');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
            }
        }
    });
    
    // Responsive resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.hunterDashboard) {
                window.hunterDashboard.renderHunters();
            }
        }, 250);
    });

    // ✅ PASANG EVENT DELEGATION SETELAH DOM SIAP
    if (window.hunterDashboard && window.hunterDashboard.elements.huntersGrid) {
        window.hunterDashboard.elements.huntersGrid.addEventListener('click', (e) => {
            const nameValue = e.target.closest('.name-value');
            if (nameValue) {
                const bar = nameValue.closest('.hunter-bar');
                const hunterId = bar?.dataset.hunterId;
                const hunter = window.hunterDashboard.hunters.find(h => h.id === hunterId);
                if (hunter) {
                    window.hunterDashboard.openMemberModal(hunter);
                }
            }
        });
    }
});

// Global error handling
window.addEventListener('error', (e) => console.error('Uncaught error:', e.error));
window.addEventListener('unhandledrejection', (e) => console.error('Unhandled promise rejection:', e.reason));
