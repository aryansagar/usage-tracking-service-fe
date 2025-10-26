import React, { useState } from 'react';
import FeatureManagement from './components/FeatureManagement';
import UsageTesting from './components/UsageTesting';
import UsageDashboard from './components/UsageDashboard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('features');

  const tabs = [
    { key: 'features', label: 'Feature Management' },
    { key: 'usage', label: 'Usage Testing' },
    { key: 'dashboard', label: 'Usage Dashboard' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'features':
        return <FeatureManagement />;
      case 'usage':
        return <UsageTesting />;
      case 'dashboard':
        return <UsageDashboard />;
      default:
        return <FeatureManagement />;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Usage Tracking Service</h1>
        <p>Manage features and track usage across different quota types</p>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <div
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}

export default App;