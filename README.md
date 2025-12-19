# HUNTER Members  - Dashboard

A premium, ultra-modern, secure, view-only dashboard for displaying HUNTER team members. This dashboard provides a sophisticated interface with advanced search, filtering, and premium animations.

## 🎨 Premium Features

### Visual Excellence
- **Ultra-Modern Dark Theme**: Deep space-inspired design with premium gradients
- **Glass Morphism Effects**: Frosted glass cards with backdrop blur
- **Premium Typography**: Inter font family with advanced font weights
- **Gradient Accents**: Multi-color gradients for premium aesthetics
- **Advanced Animations**: Smooth entrance animations and micro-interactions
- **Custom SVG Icons**: Integrated SVG icons for enhanced visual appeal

### Advanced Functionality
- **Intelligent Search**: Real-time search with debounced input
- **Smart Filtering**: Advanced group filtering with dropdown
- **Premium Status Indicators**: Animated status badges with pulse effects
- **Member Timeline**: Shows how long each member has been with the team
- **Live Statistics**: Real-time member count with hover effects
- **Responsive Grid**: Adaptive layout for all screen sizes

### 🎛️ Professional Controls
- **Dual View Modes**: Toggle between Card View and List View
- **Smart Sorting**: Sort by Name, Date, ID with visual indicators
- **Sticky Table Header**: Table header remains visible during scroll
- **Keyboard Shortcuts**: 
  - `Ctrl+F` or `Cmd+F`: Focus search
  - `Ctrl+1` or `Cmd+1`: Switch to Bar View
  - `Ctrl+2` or `Cmd+2`: Switch to Table View
  - `Escape`: Clear search
- **Dual View System**: Bar View (horizontal) and Table View (traditional table)

### Security & Performance
- **View-Only Security**: No data modification capabilities
- **No External Dependencies**: All functionality runs client-side
- **Optimized Loading**: Fast initial load with progressive enhancement
- **Accessibility Compliant**: WCAG 2.1 compliant with reduced motion support

## 🎨 Premium Design Showcase

### Visual Effects
- **Gradient Backgrounds**: Multi-layered radial gradients create depth
- **Glass Bars**: Horizontal bars with backdrop blur and subtle transparency
- **Hover Animations**: Bars slide and glow on interaction
- **Status Animations**: Pulse effects on status indicators
- **Loading Animations**: Dual-layer spinning loader
- **Entrance Animations**: Staggered bar appearance with slide-in effect

### Color Palette
- **Deep Space Theme**: Dark background with premium depth
- **Accent Gradients**: Indigo, purple, and cyan blend
- **Status Colors**: Carefully chosen semantic colors
- **Text Hierarchy**: Multiple levels of text opacity and weight

## 🎛️ View Management

### Bar View (Horizontal List)
- **Premium Horizontal Bars**: Glass morphism bar layout with hover effects
- **Compact Information**: ID | Name | Category | Status | Date in single row
- **Visual Appeal**: Gradient accents and slide-in animations
- **Space Efficient**: Maximum information in minimal space
- **Slide Animations**: Bars slide in from left with staggered timing
- **Hover Effects**: Bars shift right and glow on interaction
- **Mobile Responsive**: Stacks vertically on smaller screens
- **Best for**: Quick scanning and space-efficient viewing

### Table View
- **Professional Table**: Clean ID | Name | Category | Status | Date layout
- **Sticky Header**: Header remains visible during scroll
- **Sortable Columns**: Click any column header to sort
- **Compact Display**: Maximum information density
- **Best for**: Detailed analysis and data comparison

### View Switching
- **Toggle Buttons**: Switch between Bar View and Table View with one click
- **Keyboard Shortcuts**: Quick view switching with Ctrl+1 (Bar) / Ctrl+2 (Table)
- **State Persistence**: Current view and sort preferences maintained
- **Responsive**: Bar view stacks vertically on mobile screens

## 🔄 Sorting & Filtering

### Smart Sorting
- **Multiple Fields**: Sort by Name, Date, or ID
- **Visual Indicators**: Active sort field highlighted
- **Direction Toggle**: Ascending/Descending with single click
- **Table Headers**: Click column headers for instant sorting

### Group Filtering
- **OKTO88 & MIO88**: Only show specific categories
- **All Groups**: View all members regardless of category
- **Real-time Filter**: Instant results as you type

## Quick Start

### 1. Upload to GitHub Pages

1. Upload all files to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Access via: `https://yourusername.github.io/repository-name`

### 2. Local Development

Simply open `index.html` in a web browser. The dashboard will load the sample data from `data/hunters.json`.

## Updating Hunter Data

### Adding New Hunters

To add new team members, edit the `data/hunters.json` file:

```json
{
  "id": "H031",
  "name": "New Hunter Name",
  "group": "G048",
  "status": "Active",
  "join_date": "2025-07-01"
}
```

### Required Fields

- **id**: Unique identifier (e.g., "H031")
- **name**: Full name of the hunter
- **group**: Group identifier (e.g., "G048", "G052")
- **status**: Either "Active" or "Inactive"
- **join_date**: Date in YYYY-MM-DD format

### Data Validation

- All fields are required
- IDs must be unique
- Status must be exactly "Active" or "Inactive"
- Dates must be in YYYY-MM-DD format

### Example JSON Structure

```json
[
  {
    "id": "H001",
    "name": "Andi Pratama",
    "group": "OKTO88",
    "status": "Active",
    "join_date": "2025-01-10"
  },
  {
    "id": "H002",
    "name": "Sarah Chen",
    "group": "MIO88",
    "status": "Active",
    "join_date": "2025-01-15"
  }
]
```

### Group Categories
- **OKTO88**: Members from OKTO88 category
- **MIO88**: Members from MIO88 category
- **Active/Inactive**: Member status indicators
- **Unique IDs**: Each member has unique identifier (H001, H002, etc.)

## Usage

### Search & Filter
- **Real-time Search**: Type in search box to filter by name or ID
- **Case-insensitive**: Search matches partial text regardless of case
- **Group Filtering**: Use dropdown to filter by OKTO88 or MIO88
- **Combined Filters**: Search and group filters work together

### Keyboard Shortcuts
- **Ctrl+F / Cmd+F**: Focus search input
- **Ctrl+1 / Cmd+1**: Switch to Bar View
- **Ctrl+2 / Cmd+2**: Switch to Table View
- **Escape**: Clear search when input is focused

### View Management
- **Bar View (Default)**: Premium horizontal bars with compact information layout
- **Table View**: Professional table with ID | Name | Category | Status | Date
- **View Toggle**: Click Bars/Tables buttons or use Ctrl+1/Ctrl+2
- **Responsive**: Bar view stacks vertically on mobile screens
- **Default View**: Dashboard loads with Bar View by default

### Sorting Options
- **Name Sorting**: Alphabetical sorting by member names
- **Date Sorting**: Chronological sorting by join date
- **ID Sorting**: Numerical sorting by member ID
- **Visual Indicators**: Active sort field highlighted with gradient
- **Direction Toggle**: Click again to reverse sort order
- **Table Headers**: Click any column header for instant sorting

### Status Indicators
- **Active**: Green badge with pulse animation
- **Inactive**: Red badge with reduced opacity
- **Status Dots**: Animated status indicators in both views

## File Structure

```
/
├── index.html              # Main dashboard page
├── favicon.svg            # Premium favicon
├── assets/
│   ├── css/
│   │   └── style.css      # Premium dashboard styling (750+ lines)
│   └── js/
│       └── app.js         # Advanced dashboard functionality (600+ lines)
├── data/
│   └── hunters.json       # Hunter members data (OKTO88 & MIO88 groups)
└── README.md              # Comprehensive documentation
```

### Key Files Overview
- **index.html**: Enhanced with premium meta tags and dual-view structure
- **style.css**: 750+ lines of premium CSS with glass effects, animations, table styles
- **app.js**: 600+ lines of advanced JavaScript with sorting, view switching, animations
- **hunters.json**: Updated data with OKTO88 and MIO88 group categories
- **favicon.svg**: Custom premium favicon with gradient

## Customization

### Colors and Theming

Edit CSS custom properties in `assets/css/style.css`:

```css
:root {
    --primary-bg: #0a0a0a;        /* Main background */
    --secondary-bg: #1a1a1a;      /* Secondary background */
    --card-bg: #242424;           /* Card background */
    --accent-color: #3b82f6;      /* Primary accent color */
    --success-color: #10b981;     /* Active status color */
    --danger-color: #ef4444;      /* Inactive status color */
}
```

### Adding New Fields

To add new data fields:

1. Update the JSON structure in `data/hunters.json`
2. Modify the card template in `assets/js/app.js` (see `createHunterCard` method)
3. Update CSS styling if needed

### Modifying Layout

The dashboard uses a CSS Grid layout. To change the card size or layout:

```css
.hunters-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}
```

## Browser Compatibility

- **Modern Browsers**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Features Used**: CSS Grid, Flexbox, ES6 JavaScript

## Security Notes

- **View-Only**: No editing, adding, or deleting functionality
- **No Data Storage**: No localStorage, cookies, or external tracking
- **No API Keys**: All functionality is client-side only
- **XSS Protection**: All user data is properly escaped

## Troubleshooting

### Data Not Loading

1. Check that `data/hunters.json` exists and is valid JSON
2. Verify file paths are correct
3. Check browser console for error messages
4. Ensure CORS is not blocking local file access (use a local server for testing)

### Styling Issues

1. Verify all CSS files are loading correctly
2. Check for JavaScript errors in browser console
3. Ensure file paths in HTML match actual file locations

### Search Not Working

1. Check browser JavaScript is enabled
2. Verify the search input element has the correct ID
3. Check for JavaScript errors in browser console

## Performance

- **Fast Loading**: Optimized for quick initial load
- **Smooth Animations**: Hardware-accelerated CSS transitions
- **Responsive**: Efficient rendering on all device sizes
- **Memory Efficient**: Minimal DOM manipulation

## License

This dashboard is created by Agent for HUNTER team management.

---

**Need Help?** Ensure all files are uploaded correctly and the JSON data follows the required format.
