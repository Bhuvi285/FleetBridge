import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-container">
      <div class="metrics-grid">
        <!-- Metric Cards -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Active Vehicles</span>
            <span class="metric-icon">🚌</span>
          </div>
          <div class="metric-value">42</div>
          <div class="metric-trend positive">↑ 12% vs last week</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Available Drivers</span>
            <span class="metric-icon">👨‍✈️</span>
          </div>
          <div class="metric-value">18</div>
          <div class="metric-trend neutral">→ 0% vs last week</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Active Trips</span>
            <span class="metric-icon">🗺️</span>
          </div>
          <div class="metric-value">27</div>
          <div class="metric-trend positive">↑ 5% vs last week</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Alerts</span>
            <span class="metric-icon">⚠️</span>
          </div>
          <div class="metric-value">3</div>
          <div class="metric-trend negative">↓ Requires attention</div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card">
          <h3>Fleet Utilization</h3>
          <div class="chart-placeholder">
            [Chart Area: Fleet Utilization over 7 days]
          </div>
        </div>
        <div class="chart-card">
          <h3>Recent Activity</h3>
          <ul class="activity-list">
            <li><strong>Trip T-1002</strong> started (Route: Downtown Loop)</li>
            <li><strong>Driver John D.</strong> logged in</li>
            <li><strong>Vehicle V-04</strong> maintenance completed</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .metric-card, .chart-card {
      background: var(--surface-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-glass);
      border-radius: 16px;
      padding: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .metric-title {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.9rem;
    }

    .metric-icon {
      font-size: 1.25rem;
      background: var(--hover-glass);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .metric-trend {
      font-size: 0.85rem;
      font-weight: 500;
    }
    .metric-trend.positive { color: var(--success); }
    .metric-trend.negative { color: var(--danger); }
    .metric-trend.neutral { color: var(--text-muted); }

    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .chart-card h3 {
      margin: 0 0 1rem 0;
      color: var(--text-primary);
      font-size: 1.1rem;
    }

    .chart-placeholder {
      height: 250px;
      background: var(--hover-glass);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      border: 1px dashed var(--border-glass);
    }

    .activity-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-list li {
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-glass);
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .activity-list li:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .activity-list strong {
      color: var(--text-primary);
    }
    
    @media (max-width: 1024px) {
      .charts-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {}
