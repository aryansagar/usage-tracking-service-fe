import React, { useState } from 'react';
import { useFeatures } from '../hooks/useFeatures';

const FeatureManagement = () => {
  const { features, loading, error, createFeature, updateFeature } = useFeatures();
  const [newFeature, setNewFeature] = useState({
    featureKey: '',
    quotaType: 'consumable',
    limit: 0,
    resetPeriod: 'daily',
    description: ''
  });
  const [editingFeature, setEditingFeature] = useState(null);
  const [createError, setCreateError] = useState('');

  const handleCreateFeature = async (e) => {
    e.preventDefault();
    setCreateError('');
    
    try {
      console.log('Creating feature with data:', newFeature);
      
      // Prepare the exact data structure as required
      const featureData = {
        featureKey: newFeature.featureKey,
        quotaType: newFeature.quotaType, // This should be dynamic
        limit: newFeature.limit,
        description: newFeature.description
      };

      // Only add resetPeriod for consumable features
      if (newFeature.quotaType === 'consumable') {
        featureData.resetPeriod = newFeature.resetPeriod;
      }
      
      const result = await createFeature(featureData);
      console.log('Feature creation result:', result);
      
      setNewFeature({
        featureKey: '',
        quotaType: 'consumable',
        limit: 1000,
        resetPeriod: 'daily',
        description: ''
      });
    } catch (err) {
      console.error('Feature creation error:', err);
      setCreateError(err.message);
    }
  };

  const handleUpdateFeature = async (e) => {
    e.preventDefault();
    try {
      await updateFeature(editingFeature.featureKey, {
        limit: editingFeature.limit,
        description: editingFeature.description
      });
      setEditingFeature(null);
    } catch (err) {
      console.error('Feature update error:', err);
    }
  };

  const handleQuotaTypeChange = (quotaType) => {
    console.log('Quota type changed to:', quotaType);
    setNewFeature(prev => ({
      ...prev,
      quotaType,
      resetPeriod: quotaType === 'consumable' ? 'daily' : undefined
    }));
  };

  if (loading) {
    return <div className="card">Loading features...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2>Create New Feature</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {createError && <div className="alert alert-error">{createError}</div>}
        
        <form onSubmit={handleCreateFeature}>
          <div className="form-group">
            <label>Feature Key:</label>
            <input
              type="text"
              value={newFeature.featureKey}
              onChange={(e) => setNewFeature(prev => ({ ...prev, featureKey: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Quota Type:</label>
            <select
              value={newFeature.quotaType}
              onChange={(e) => handleQuotaTypeChange(e.target.value)}
              required
            >
              <option value="consumable">Consumable (Time-based)</option>
              <option value="slot_based">Slot-based (Static)</option>
            </select>
            <small>Current selected: {newFeature.quotaType}</small>
          </div>
          
          <div className="form-group">
            <label>Limit:</label>
            <input
              type="number"
              value={newFeature.limit}
              onChange={(e) => setNewFeature(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              required
              min="1"
            />
          </div>
          
          {newFeature.quotaType === 'consumable' && (
            <div className="form-group">
              <label>Reset Period:</label>
              <select
                value={newFeature.resetPeriod}
                onChange={(e) => setNewFeature(prev => ({ ...prev, resetPeriod: e.target.value }))}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label>Description:</label>
            <input
              type="text"
              value={newFeature.description}
              onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          
          <button type="submit">Create Feature</button>
        </form>
      </div>

      <div className="card">
        <h2>Existing Features ({features.length})</h2>
        <div className="feature-list">
          {features.map(feature => (
            <div key={feature.featureKey} className="feature-item">
              <h3>{feature.featureKey}</h3>
              <p>{feature.description}</p>
              <p><strong>Type:</strong> {feature.quotaType} 
                {feature.quotaType === 'consumable' && ` (${feature.resetPeriod})`}
              </p>
              <p><strong>Limit:</strong> {feature.limit}</p>
              <div className="feature-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setEditingFeature(feature)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureManagement;