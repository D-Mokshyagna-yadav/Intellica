/**
 * RESPONSIVE COMPONENT TEMPLATE
 * 
 * Template for converting any dashboard component to be fully responsive.
 * Follow this pattern for consistency across the application.
 */

import { useMemo, useState, useRef } from "react";
import { useResponsive } from "../../../hooks/useResponsive";
import "../../../styles/responsiveDashboard.css";

function ResponsiveDashboardTemplate({ data }) {
  
  // 1. Import and use the responsive hook
  const responsive = useResponsive();
  
  // 2. State management
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const tableRef = useRef(null);
  
  // 3. Defensive filtering and calculations
  const calculations = useMemo(() => {
    return {
      total: data.reduce((sum, item) => sum + (item.value || 0), 0),
      count: data.length,
    };
  }, [data]);
  
  // 4. Return JSX with responsive classes
  return (
    <div className="dashboard-container">
      
      {/* Header */}
      <h2 className="dashboard-title">Dashboard Title</h2>
      
      {/* Summary Cards - Responsive Grid */}
      <div className="summary-row">
        <SummaryCard title="Total" value={calculations.total} />
        <SummaryCard title="Count" value={calculations.count} />
        <SummaryCard title="Status" value="Active" />
      </div>
      
      {/* Category Cards - Responsive Grid */}
      <div className="category-grid">
        {data.map(item => (
          <CategoryCard 
            key={item.id} 
            title={item.name} 
            value={item.value}
            onClick={() => setSelectedItem(item)}
          />
        ))}
      </div>
      
      {/* Filters - Responsive Bar */}
      {selectedItem && (
        <div className="filter-bar">
          <input
            type="text"
            className="filter-input"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <select className="filter-select">
            <option>All Options</option>
          </select>
          <button className="download-btn">Download</button>
        </div>
      )}
      
      {/* Table Section - Mobile Cards / Desktop Table */}
      {selectedItem && (
        <div ref={tableRef} className="table-section">
          <h3>{selectedItem.name}</h3>
          
          {responsive.isMobile ? (
            // Mobile View: Cards
            <div className="table-card-list">
              {data.map(item => (
                <div key={item.id} className="table-card">
                  <div className="table-card-row">
                    <span className="table-card-label">Name</span>
                    <span className="table-card-value">{item.name}</span>
                  </div>
                  <div className="table-card-row">
                    <span className="table-card-label">Value</span>
                    <span className="table-card-value">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop View: Table
            <div className="table-wrapper">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.value}</td>
                      <td>{item.status || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResponsiveDashboardTemplate;

/* ============================================
   SUB-COMPONENTS
   ============================================ */

function SummaryCard({ title, value, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="summary-card"
      style={{ ...(hover ? { background: "#f0f9ff" } : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <h2>{value}</h2>
      <p>{title}</p>
    </div>
  );
}

function CategoryCard({ title, value, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="category-card"
      style={{ ...(hover ? { background: "#f0f9ff" } : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <h3>{title}</h3>
      <p>Count</p>
      <h2>{value}</h2>
    </div>
  );
}

/*
 * MIGRATION CHECKLIST
 * 
 * When converting a component to be responsive:
 * 
 * [ ] Import useResponsive hook
 * [ ] Import responsive CSS file
 * [ ] Replace inline container styles with .dashboard-container
 * [ ] Replace flex/grid layouts with responsive CSS classes
 * [ ] Add mobile-specific conditional rendering for tables
 * [ ] Replace all hardcoded widths/heights with responsive values
 * [ ] Update font sizes using responsive scaling (in CSS)
 * [ ] Test on actual mobile devices
 * [ ] Update touch targets to minimum 44px
 * [ ] Verify all interactive elements are keyboard accessible
 * [ ] Test landscape and portrait orientations
 * [ ] Remove old inline style constants
 * 
 * TESTING BREAKPOINTS:
 * - Mobile: 375px (iPhone SE), 414px (iPhone 12), 540px (large phone)
 * - Tablet: 768px (iPad), 1024px (iPad Pro)
 * - Desktop: 1280px (standard), 1920px (large)
 * 
 * USE BROWSER DEVTOOLS:
 * - F12 → Click responsive design mode (Ctrl+Shift+M)
 * - Test at different breakpoints
 * - Check touch events and gestures
 */
