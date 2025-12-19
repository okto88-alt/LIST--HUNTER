 * View-only dashboard for displaying team members
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
        this.currentView = 'cards';
        
        // DOM elements
        this.elements = {
            totalCount: document.getElementById('total-count'),
            huntersCards: document.getElementById('hunters-cards'),
            huntersCompact: document.getElementById('hunters-compact'),
            searchInput: document.getElementById('search-input'),
            groupFilter: document.getElementById('group-filter'),
            noResults: document.getElementById('no-results'),
            loading: document.getElementById('loading'),
            
            // Sort buttons
            sortName: document.getElementById('sort-name'),
            sortDate: document.getElementById('sort-date')
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
            this.setView('cards');
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
     * Load hunters and registration data from JSON files
     */
    async loadHunters() {
        try {
            // Load data from JSON files
            const [oktoData, mioData, registrationsData] = await Promise.all([
                fetch('./data/hunters-okto88.json').then(response => {
                    if (!response.ok) throw new Error('Failed to load OKTO88 data');
                    return response.json();
                }),
                fetch('./data/hunters-mio88.json').then(response => {
                    if (!response.ok) throw new Error('Failed to load MIO88 data');
                    return response.json();
                }),
                fetch('./data/registrations.json').then(response => {
                    if (!response.ok) throw new Error('Failed to load registrations data');
                    return response.json();
                })
            ]);

            // Combine data from both groups
            this.hunters = [
                ...oktoData.map(hunter => ({ ...hunter, category: "MI088" })),
                ...mioData.map(hunter => ({ ...hunter, category: "MI088" }))
            ];

            this.filteredHunters = [...this.hunters];
            
            // Set registrations data for modal
            this.registrations = registrationsData;

        } catch (error) {
            console.error('Error loading hunters', error);
            // Fallback to local data if files can't be loaded
            console.log('Using fallback data...');
            this.hunters = this.getFallbackHuntersData();
            this.filteredHunters = [...this.hunters];
            this.registrations = this.getFallbackRegistrationsData();
        }
    }

    /**
     * Fallback hunters data (in case JSON files fail to load)
     */
    getFallbackHuntersData() {
        return [
            {
                id: "O01",
                name: "Reno ade Putra",
                level: "VIP",
                category: "MI088",
                status: "Active",
                join_date: "2025-01-10",
                group: "OKTO88"
            },
            {
                id: "M01",
                name: "Deasy Fathira",
                level: "VIP",
                category: "MI088",
                status: "Active",
                join_date: "2025-06-25",
                group: "MIO88"
            }
        ];
    }

    /**
     * Fallback registrations data
     */
    getFallbackRegistrationsData() {
        return {
            "O01": ["ID8891", "ID8892", "ID8893"],
            "M01": ["ID7721", "ID7722"]
        };
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
        // View toggle buttons - using event delegation
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.setView(view);
            });
        });
        
        // Sort buttons
        this.elements.sortName.addEventListener('click', () => this.toggleSort('name'));
        this.elements.sortDate.addEventListener('click', () => this.toggleSort('join_date'));
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
     * Set current view (cards or compact)
     */
    setView(view) {
        this.currentView = view;
        
        // Update button states
        const buttons = document.querySelectorAll('.view-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Hide all views
        document.getElementById('hunters-cards').style.display = 'none';
        document.getElementById('hunters-compact').style.display = 'none';
        
        // Show selected view
        switch(view) {
            case 'cards':
                document.getElementById('hunters-cards').style.display = 'grid';
                break;
            case 'compact':
                document.getElementById('hunters-compact').style.display = 'flex';
                break;
        }
        
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
        this.elements.sortDate.classList.toggle('active', this.currentSort === 'join_date');
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
                case 'join_date':
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
        // No Results hanya jika search aktif
        if (this.filteredHunters.length === 0 && this.currentSearch.length > 0) {
            this.showNoResults();
            return;
        }

        // Selain itu, jangan ganggu UI
        this.hideNoResults();

        switch(this.currentView) {
            case 'cards':
                this.renderCardsView();
                break;
            case 'compact':
                this.renderCompactView();
                break;
            default:
                this.renderCardsView();
        }
    }
    
    /**
     * Render bar view
     */
    renderCardsView() {
        const grid = this.elements.huntersCards || document.getElementById('hunters-cards');
        if (!grid) return;
        
        grid.innerHTML = '';
        this.filteredHunters.forEach(hunter => {
            const card = this.createHunterCard(hunter);
            grid.appendChild(card);
        });
    }

    renderCompactView() {
        const compactList = this.elements.huntersCompact || document.getElementById('hunters-compact');
        if (!compactList) return;
        
        compactList.innerHTML = '';
        this.filteredHunters.forEach(hunter => {
            const item = this.createHunterCompactItem(hunter);
            compactList.appendChild(item);
        });
    }

    

    


    


    


    /**
     * Create premium hunter card
     */
    createHunterCard(hunter) {
        const card = document.createElement('div');
        card.className = `hunter-card ${hunter.status.toLowerCase() === 'inactive' ? 'inactive' : ''}`;
        card.dataset.hunterId = hunter.id;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        // Get initials for avatar
        const initials = this.getInitials(hunter.name);
        
        // Get registration count
        const registrationCount = this.registrations?.[hunter.id]?.length || 0;
        const levelClass = hunter.level ? hunter.level.toLowerCase() : 'newbie';

        const formattedDate = this.formatDate(hunter.join_date);
        const memberSince = this.getMemberSince(hunter.join_date);

        card.innerHTML = `
            <div class="card-header">
                <div class="hunter-avatar">
                    ${initials}
                </div>
                <div class="hunter-info">
                    <h3>${this.escapeHtml(hunter.name)}</h3>
                    <div class="hunter-meta">
                        <span class="hunter-id">${this.escapeHtml(hunter.id)}</span>
                        <span class="hunter-level-badge level-badge ${levelClass}">${this.escapeHtml(hunter.level || 'NEWBIE')}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <div class="hunter-status ${hunter.status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive'}">
                    ${this.escapeHtml(hunter.status)}
                </div>
                <div class="hunter-group">
                    <span class="group-tag">${this.escapeHtml(hunter.group)}</span>
                </div>
            </div>
            <div class="card-stats">
                <div class="stat-item">
                    <div class="stat-value">${registrationCount}</div>
                    <div class="stat-label">IDs</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${memberSince}</div>
                    <div class="stat-label">Member Since</div>
                </div>
            </div>
        `;

        // Add click event
        card.addEventListener('click', () => {
            this.openMemberModal(hunter);
        });

        // Animate entrance
        requestAnimationFrame(() => {
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, Math.random() * 200);
        });

        return card;
    }

    /**
     * Create compact hunter item
     */
    createHunterCompactItem(hunter) {
        const item = document.createElement('div');
        item.className = `compact-hunter-item ${hunter.status.toLowerCase() === 'inactive' ? 'inactive' : ''}`;
        item.dataset.hunterId = hunter.id;
        item.style.opacity = '0';
        item.style.transform = 'translateX(-10px)';

        // Get initials for avatar
        const initials = this.getInitials(hunter.name);
        const registrationCount = this.registrations?.[hunter.id]?.length || 0;
        const levelClass = hunter.level ? hunter.level.toLowerCase() : 'newbie';

        const formattedDate = this.formatDate(hunter.join_date);
        const memberSince = this.getMemberSince(hunter.join_date);

        item.innerHTML = `
            <div class="hunter-avatar">
                ${initials}
            </div>
            <div class="compact-hunter-info">
                <h3>${this.escapeHtml(hunter.name)}</h3>
                <div class="compact-hunter-details">
                    <span class="hunter-id">${this.escapeHtml(hunter.id)}</span>
                    <span class="group-tag">${this.escapeHtml(hunter.group)}</span>
                    <div class="compact-level-badge level-badge ${levelClass}">
                        <span class="level-icon"></span>
                        ${this.escapeHtml(hunter.level || 'NEWBIE')}
                    </div>
                </div>
            </div>
            <div class="compact-stats">
                <div class="stat-item">
                    <div class="stat-value">${registrationCount}</div>
                    <div class="stat-label">IDs</div>
                </div>
            </div>
        `;

        // Add click event
        item.addEventListener('click', () => {
            this.openMemberModal(hunter);
        });

        // Animate entrance
        requestAnimationFrame(() => {
            setTimeout(() => {
                item.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, Math.random() * 100);
        });

        return item;
    }

    /**
     * Get initials from hunter name
     */
    getInitials(name) {
        if (!name) return '?';
        const names = name.trim().split(' ');
        if (names.length === 1) {
            return names[0].substring(0, 2).toUpperCase();
        }
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }

    /**
     * Open modal to show registered IDs for a hunter
     */
    openMemberModal(hunter) {
        // Get registered IDs from the registrations data
        const ids = this.registrations?.[hunter.id] || [];
        const displayedLevel = hunter.level || 'N/A';

        // Create modal if it doesn't exist
        let modal = document.getElementById('member-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'member-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        // Generate ID chips
        const idChips = ids.length > 0 
            ? ids.map(id => `<div class="id-chip" title="Registered ID: ${this.escapeHtml(id)}">${this.escapeHtml(id)}</div>`).join('')
            : '<div class="no-ids">No registered IDs found</div>';

        modal.innerHTML = `
            <div class="modal-container">
                <button class="modal-close" id="modal-close">✕</button>
                <h2>${this.escapeHtml(hunter.name)} (${this.escapeHtml(displayedLevel)})</h2>
                <div class="hunter-info">
                    <div class="info-item">
                        <span class="info-label">ID:</span>
                        <span class="info-value">${this.escapeHtml(hunter.id)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Category:</span>
                        <span class="info-value">${this.escapeHtml(hunter.category || 'MI088')}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="info-value">${this.escapeHtml(hunter.status)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Registration Date:</span>
                        <span class="info-value">${this.formatDate(hunter.join_date)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Group:</span>
                        <span class="info-value">${this.escapeHtml(hunter.group)}</span>
                    </div>
                </div>
                <div class="registered-section">
                    <h3 class="section-title">
                        Registered IDs 
                        <span class="id-count">(${ids.length})</span>
                    </h3>
                    <div class="ids-grid">
                        ${idChips}
                    </div>
                </div>
            </div>
        `;

        // Setup close functionality
        const closeButton = modal.querySelector('#modal-close');
        if (closeButton) {
            closeButton.onclick = () => this.closeModal();
        }

        // Close modal when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Show modal
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);

        // Add escape key listener
        document.addEventListener('keydown', this.handleEscapeKey.bind(this));
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('member-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        // Remove escape key listener
        document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
    }

    /**
     * Handle escape key press
     */
    handleEscapeKey(event) {
        if (event.key === 'Escape') {
            this.closeModal();
        }
    }
    
    /**
     * Update total count
     */
    updateTotalCount() {
        this.elements.totalCount.textContent = this.hunters.length;
    }
    
    showNoResults() {
        this.elements.huntersCards.style.display = 'none';
        this.elements.huntersCompact.style.display = 'none';
        this.elements.noResults.style.display = 'flex';
    }
    
    hideNoResults() {
        // Show the current view
        switch(this.currentView) {
            case 'cards':
                this.elements.huntersCards.style.display = 'grid';
                break;
            case 'compact':
                this.elements.huntersCompact.style.display = 'flex';
                break;
        }
        this.elements.noResults.style.display = 'none';
    }
    
    hideLoading() {
        this.elements.loading.style.display = 'none';
    }
    
    showError(message) {
        this.hideLoading();
        this.elements.huntersCards.innerHTML = `
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
        this.elements.huntersCards.style.display = 'grid';
        this.elements.huntersCompact.style.display = 'none';
        this.elements.noResults.style.display = 'none';
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
            window.hunterDashboard?.setView('cards');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '2') {
            e.preventDefault();
            window.hunterDashboard?.setView('compact');
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
});

// GLOBAL EVENT DELEGATION (CLICK FUNCTIONALITY)
document.addEventListener('click', (e) => {
    // Handle clicks on hunter names/cards/compact items
    const clickableElement = e.target.closest('.name-value, .hunter-card, .compact-hunter-item');
    if (!clickableElement) return;

    // Stop all side effects
    e.preventDefault();
    e.stopPropagation();

    // Find the hunter element (could be in any view)
    const hunterElement = clickableElement.closest('.hunter-card, .compact-hunter-item, .hunter-bar');
    if (!hunterElement) return;

    const hunterId = hunterElement.dataset.hunterId;
    const dashboard = window.hunterDashboard;
    if (!dashboard) return;

    const hunter = dashboard.hunters.find(h => h.id === hunterId);
    if (!hunter) return;

    dashboard.openMemberModal(hunter);
});

// Global error handling
window.addEventListener('error', (e) => console.error('Uncaught error:', e.error));
window.addEventListener('unhandledrejection', (e) => console.error('Unhandled promise rejection:', e.reason));
