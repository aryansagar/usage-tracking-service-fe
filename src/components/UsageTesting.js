import React, { useState, useEffect } from 'react';
import { usageAPI } from '../services/api';
import { useFeatures } from '../hooks/useFeatures';

const UsageTesting = () => {
  const { features } = useFeatures();
  const [checkData, setCheckData] = useState({
    userId: '',
    featureKey: '',
    requestedAmount: 100,
    slotId: ''
  });
  const [recordData, setRecordData] = useState({
    userId: '',
    featureKey: '',
    amount: 100,
    slotId: ''
  });
  const [checkResult, setCheckResult] = useState(null);
  const [recordResult, setRecordResult] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [recordError, setRecordError] = useState('');
  const [slotError, setSlotError] = useState('');
  const [checkSuccess, setCheckSuccess] = useState(false);
  const [recordSuccess, setRecordSuccess] = useState(false);
  const [slotSuccess, setSlotSuccess] = useState(false);

  // 🎯 FIXED: Better feature type detection
  const getFeatureType = (featureKey) => {
    if (!featureKey) return null;
    
    const feature = features.find(f => f.featureKey === featureKey);
    console.log('🔍 getFeatureType:', { 
      featureKey, 
      foundFeature: feature,
      quotaType: feature?.quotaType 
    });
    
    return feature?.quotaType;
  };

  const getUsagePercentage = (usage) => {
    return ((usage.currentUsage / usage.limit) * 100).toFixed(1);
  };

  // Clear all errors
  const clearErrors = () => {
    setCheckError('');
    setRecordError('');
    setSlotError('');
  };

  // Clear all success states
  const clearSuccess = () => {
    setCheckSuccess(false);
    setRecordSuccess(false);
    setSlotSuccess(false);
  };

  const handleCheckUsage = async (e) => {
    e.preventDefault();
    
    if (!checkData.userId || !checkData.featureKey) {
      setCheckError('User ID and Feature are required');
      return;
    }

    setCheckLoading(true);
    clearErrors();
    clearSuccess();
    
    try {
      // 🎯 FIX: Only send relevant data based on feature type
      const requestData = {
        userId: checkData.userId,
        featureKey: checkData.featureKey,
        requestedAmount: getFeatureType(checkData.featureKey) === 'consumable' 
          ? checkData.requestedAmount 
          : 1 // For slot-based, we check if we can allocate 1 slot
      };

      console.log('🔍 Check Usage Request:', requestData);
      
      const response = await usageAPI.check(requestData);
      setCheckResult(response.data);
      setCheckSuccess(true);
    } catch (err) {
      setCheckError(err.response?.data?.error || 'Failed to check usage');
    } finally {
      setCheckLoading(false);
    }
  };

  const handleRecordUsage = async (e) => {
    e.preventDefault();
    
    if (!recordData.userId || !recordData.featureKey) {
      setRecordError('User ID and Feature are required');
      return;
    }

    setRecordLoading(true);
    clearErrors();
    clearSuccess();
    
    try {
      // 🎯 FIX: Only send amount for consumable features
      const requestData = {
        userId: recordData.userId,
        featureKey: recordData.featureKey,
        amount: recordData.amount
      };

      console.log('🔍 Record Usage Request:', requestData);
      
      const response = await usageAPI.record(requestData);
      setRecordResult(response.data);
      setRecordSuccess(true);
    } catch (err) {
      setRecordError(err.response?.data?.error || 'Failed to record usage');
    } finally {
      setRecordLoading(false);
    }
  };

  const handleAllocateSlot = async () => {
    if (!recordData.userId || !recordData.featureKey || !recordData.slotId) {
      setSlotError('User ID, Feature, and Slot ID are required');
      return;
    }

    setSlotLoading(true);
    clearErrors();
    clearSuccess();
    
    try {
      const response = await usageAPI.allocateSlot({
        userId: recordData.userId,
        featureKey: recordData.featureKey,
        slotId: recordData.slotId,
        metadata: {
          allocatedAt: new Date().toISOString(),
          source: 'usage-testing-panel'
        }
      });
      setRecordResult(response.data);
      setSlotSuccess(true);
    } catch (err) {
      setSlotError(err.response?.data?.error || 'Failed to allocate slot');
    } finally {
      setSlotLoading(false);
    }
  };

  const handleDeallocateSlot = async () => {
    if (!recordData.userId || !recordData.featureKey || !recordData.slotId) {
      setSlotError('User ID, Feature, and Slot ID are required');
      return;
    }

    setSlotLoading(true);
    clearErrors();
    clearSuccess();
    
    try {
      const response = await usageAPI.deallocateSlot({
        userId: recordData.userId,
        featureKey: recordData.featureKey,
        slotId: recordData.slotId
      });
      setRecordResult(response.data);
      setSlotSuccess(true);
    } catch (err) {
      setSlotError(err.response?.data?.error || 'Failed to deallocate slot');
    } finally {
      setSlotLoading(false);
    }
  };

  // Set default feature key when features load
  useEffect(() => {
    if (features.length > 0 && !checkData.featureKey) {
      setCheckData(prev => ({ ...prev, featureKey: features[0].featureKey }));
      setRecordData(prev => ({ ...prev, featureKey: features[0].featureKey }));
    }
  }, [features]);

  // Reset success states after 3 seconds
  useEffect(() => {
    const timers = [];
    if (checkSuccess) timers.push(setTimeout(() => setCheckSuccess(false), 3000));
    if (recordSuccess) timers.push(setTimeout(() => setRecordSuccess(false), 3000));
    if (slotSuccess) timers.push(setTimeout(() => setSlotSuccess(false), 3000));
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [checkSuccess, recordSuccess, slotSuccess]);

  return (
    <div className="grid">
      {/* 🎯 ENHANCED DEBUG PANEL */}

      {/* Check Usage Panel */}
      <div className={`card ${checkSuccess ? 'operation-success' : ''}`}>
        <h2>Check Usage</h2>
        {checkError && <div className="alert alert-error">{checkError}</div>}
        {checkSuccess && <div className="alert alert-success">✓ Usage checked successfully!</div>}
        
        <form onSubmit={handleCheckUsage}>
          <div className="form-group">
            <label>User ID:</label>
            <input
              type="text"
              value={checkData.userId}
              onChange={(e) => setCheckData(prev => ({ ...prev, userId: e.target.value }))}
              placeholder="Enter user ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Feature:</label>
            <select
              value={checkData.featureKey}
              onChange={(e) => setCheckData(prev => ({ ...prev, featureKey: e.target.value }))}
              required
            >
              <option value="">Select a feature</option>
              {features.map(feature => (
                <option key={feature.featureKey} value={feature.featureKey}>
                  {feature.featureKey} ({feature.quotaType})
                </option>
              ))}
            </select>
          </div>
          
          {getFeatureType(checkData.featureKey) === 'consumable' ? (
            <div className="form-group">
              <label>Requested Amount:</label>
              <input
                type="number"
                value={checkData.requestedAmount}
                onChange={(e) => setCheckData(prev => ({ ...prev, requestedAmount: parseInt(e.target.value) || 0 }))}
                required
                min="0"
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Slot ID (for allocation check):</label>
              <input
                type="text"
                value={checkData.slotId}
                onChange={(e) => setCheckData(prev => ({ ...prev, slotId: e.target.value }))}
                placeholder="Enter slot ID to check allocation"
              />
              <small>Note: For slot-based features, we check if 1 slot can be allocated</small>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={checkLoading || !checkData.userId || !checkData.featureKey}
            className={checkLoading ? 'btn-loading' : ''}
          >
            {checkLoading ? '🔍 Checking...' : 'Check Usage'}
          </button>
        </form>

        {checkResult && (
          <div className={`usage-item ${checkResult.allowed ? 'usage-allowed' : 'usage-denied'}`}>
            <h3>Check Result for {checkData.userId}</h3>
            <p><strong>Allowed:</strong> {checkResult.allowed ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Current Usage:</strong> {checkResult.currentUsage}</p>
            <p><strong>Remaining:</strong> {checkResult.remaining}</p>
            <p><strong>Limit:</strong> {checkResult.limit}</p>
            {checkResult.resetsAt && (
              <p><strong>Resets At:</strong> {new Date(checkResult.resetsAt).toLocaleString()}</p>
            )}
            {checkResult.allocatedSlots && checkResult.allocatedSlots.length > 0 && (
              <>
                <p><strong>Allocated Slots:</strong></p>
                <div>
                  {checkResult.allocatedSlots.map(slot => (
                    <span key={slot} className="slot-item">{slot}</span>
                  ))}
                </div>
              </>
            )}
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getUsagePercentage(checkResult)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Record Usage Panel */}
      <div className={`card ${recordSuccess || slotSuccess ? 'operation-success' : ''}`}>
        <h2>Record Usage / Slot Operations</h2>
        {recordError && <div className="alert alert-error">{recordError}</div>}
        {slotError && <div className="alert alert-error">{slotError}</div>}
        {(recordSuccess || slotSuccess) && <div className="alert alert-success">✓ Operation completed successfully!</div>}
        
        <form>
          <div className="form-group">
            <label>User ID:</label>
            <input
              type="text"
              value={recordData.userId}
              onChange={(e) => setRecordData(prev => ({ ...prev, userId: e.target.value }))}
              placeholder="Enter user ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Feature:</label>
            <select
              value={recordData.featureKey}
              onChange={(e) => setRecordData(prev => ({ ...prev, featureKey: e.target.value }))}
              required
            >
              <option value="">Select a feature</option>
              {features.map(feature => (
                <option key={feature.featureKey} value={feature.featureKey}>
                  {feature.featureKey} ({feature.quotaType})
                </option>
              ))}
            </select>
          </div>
          
          {getFeatureType(recordData.featureKey) === 'consumable' ? (
            <>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  value={recordData.amount}
                  onChange={(e) => setRecordData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
              <button 
                type="button" 
                onClick={handleRecordUsage}
                disabled={recordLoading || !recordData.userId || !recordData.featureKey}
                className={recordLoading ? 'btn-loading' : ''}
              >
                {recordLoading ? '📝 Recording...' : 'Record Usage'}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Slot ID:</label>
                <input
                  type="text"
                  value={recordData.slotId}
                  onChange={(e) => setRecordData(prev => ({ ...prev, slotId: e.target.value }))}
                  placeholder="Enter unique slot ID"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={handleAllocateSlot}
                  disabled={slotLoading || !recordData.userId || !recordData.featureKey || !recordData.slotId}
                  className={`btn-primary ${slotLoading ? 'btn-loading' : ''}`}
                >
                  {slotLoading ? '🔒 Allocating...' : 'Allocate Slot'}
                </button>
                <button 
                  type="button" 
                  onClick={handleDeallocateSlot}
                  disabled={slotLoading || !recordData.userId || !recordData.featureKey || !recordData.slotId}
                  className={`btn-secondary ${slotLoading ? 'btn-loading' : ''}`}
                >
                  {slotLoading ? '🔓 Deallocating...' : 'Deallocate Slot'}
                </button>
              </div>
            </>
          )}
        </form>

        {recordResult && (
          <div className="usage-item usage-allowed">
            <h3>Operation Result for {recordData.userId}</h3>
            <p><strong>Success:</strong> {recordResult.success ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Current Usage:</strong> {recordResult.currentUsage}</p>
            <p><strong>Remaining:</strong> {recordResult.remaining}</p>
            <p><strong>Limit:</strong> {recordResult.limit}</p>
            {recordResult.allocatedSlots && (
              <>
                <p><strong>Allocated Slots:</strong></p>
                <div>
                  {recordResult.allocatedSlots.map(slot => (
                    <span key={slot} className="slot-item">{slot}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageTesting;