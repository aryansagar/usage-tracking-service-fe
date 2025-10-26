import React, { useState } from 'react';
import { usageAPI } from '../services/api';

const UsageDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    userId: 'user123'
  });
  const [userUsage, setUserUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getUsagePercentage = (usage) => {
    if (!usage || usage.limit === 0) return 0;
    return ((usage.currentUsage / usage.limit) * 100).toFixed(1);
  };

  const formatResetTime = (resetsAt) => {
    if (!resetsAt) return 'Never (static quota)';
    
    // Fix the userId if it has a colon prefix
    const fixedResetsAt = resetsAt.replace && resetsAt.replace(/^:/, '') ? resetsAt.replace(/^:/, '') : resetsAt;
    const date = new Date(fixedResetsAt);
    return date.toLocaleString();
  };

  const loadUserUsage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await usageAPI.getAllUserUsage(dashboardData.userId);
      console.log('📊 Full response:', response.data);
      
      // Fix the userId if it has a colon prefix
      const fixedData = {
        ...response.data,
        userId: response.data.userId.replace(/^:/, '') // Remove leading colon
      };
      
      setUserUsage(fixedData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user usage');
      setUserUsage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>User Usage Overview</h2>
      
      <form onSubmit={loadUserUsage} style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>User ID:</label>
          <input
            type="text"
            value={dashboardData.userId}
            onChange={(e) => setDashboardData(prev => ({ ...prev, userId: e.target.value }))}
            placeholder="Enter user ID"
            required
          />
        </div>
        <button type="submit" disabled={loading || !dashboardData.userId}>
          {loading ? 'Loading...' : 'Load Usage'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {userUsage && (
        <div>
          <h3>Usage for {userUsage.userId}</h3>
          
          {/* Show ALL features - remove the filter */}
          {userUsage.usage && userUsage.usage.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {userUsage.usage.map(usage => {
                // Fix each usage item's userId if needed
                const fixedUsage = {
                  ...usage,
                  userId: usage.userId.replace(/^:/, ''),
                  resetsAt: usage.resetsAt && usage.resetsAt.replace ? usage.resetsAt.replace(/^:/, '') : usage.resetsAt
                };
                
                return (
                  <div key={fixedUsage.featureKey} className="usage-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4>{fixedUsage.featureKey}</h4>
                      <span className={`usage-badge ${fixedUsage.currentUsage > 0 ? 'usage-active' : 'usage-available'}`}>
                        {fixedUsage.currentUsage > 0 ? 'Active' : 'Available'}
                      </span>
                    </div>
                    
                    <p><strong>Usage:</strong> {fixedUsage.currentUsage} / {fixedUsage.limit}</p>
                    <p><strong>Remaining:</strong> {fixedUsage.remaining}</p>
                    
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${getUsagePercentage(fixedUsage)}%` }}
                      ></div>
                    </div>
                    
                    {fixedUsage.resetsAt && (
                      <p>
                        <strong>Resets At:</strong> {formatResetTime(fixedUsage.resetsAt)}
                        <br />
                        <small style={{ color: '#666' }}>
                          {(() => {
                            const now = new Date();
                            const resetTime = new Date(fixedUsage.resetsAt);
                            const diffMs = resetTime - now;
                            if (diffMs <= 0) return 'Resetting now...';
                            
                            const hours = Math.floor(diffMs / (1000 * 60 * 60));
                            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            return `Resets in ${hours}h ${minutes}m`;
                          })()}
                        </small>
                      </p>
                    )}
                    
                    {fixedUsage.allocatedSlots && fixedUsage.allocatedSlots.length > 0 && (
                      <>
                        <p><strong>Allocated Slots ({fixedUsage.allocatedSlots.length}):</strong></p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {fixedUsage.allocatedSlots.map(slot => (
                            <span key={slot} className="slot-item" style={{
                              background: '#e9ecef',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              {slot}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-usage">
              <p>No usage data found for this user.</p>
              <p><small>User hasn't used any features yet.</small></p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .usage-item {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin: 10px 0;
        }

        .progress-fill {
          height: 100%;
          background: #28a745;
          transition: width 0.3s ease;
        }

        .usage-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .usage-active {
          background: #d4edda;
          color: #155724;
        }

        .usage-available {
          background: #e2e3e5;
          color: #383d41;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .no-usage {
          text-align: center;
          padding: 40px;
          color: #6c757d;
          background: #f8f9fa;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default UsageDashboard;