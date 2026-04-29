import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import OrgChart from './components/OrgChart';
import { loadStaticDemoData, createFallbackDemoData } from './utils/demoDataAdapter';
import './components/OrgChart.css';

function DemoApp() {
  const [demoData, setDemoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      // Try to load static demo data first
      const staticData = loadStaticDemoData();
      
      if (staticData) {
        setDemoData(staticData);
      } else {
        // Fall back to built-in demo data
        console.warn('Static demo data not found, using fallback data');
        setDemoData(createFallbackDemoData());
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading demo data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load demo data');
      setLoading(false);
    }
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Reload the page to retry loading static data
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Loading Pedigree Org Chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <div>Failed to load demo data: {error}</div>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  if (!demoData) {
    return (
      <div className="error">
        <div>No demo data available</div>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  return (
    <div className="org-chart-container">
      <OrgChart 
        data={demoData} 
        expanded={expanded}
        onToggleExpanded={() => setExpanded(!expanded)}
      />
    </div>
  );
}

// Initialize the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<DemoApp />);
} else {
  console.error('Root container not found');
}
