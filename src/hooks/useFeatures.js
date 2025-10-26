import { useState, useEffect } from 'react';
import { featureAPI } from '../services/api';

export const useFeatures = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await featureAPI.getAll();
      setFeatures(response.data.features);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const createFeature = async (featureData) => {
    try {
      setError(null);
      const response = await featureAPI.create(featureData);
      await loadFeatures(); // Reload features list
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create feature';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateFeature = async (featureKey, updates) => {
    try {
      setError(null);
      const response = await featureAPI.update(featureKey, updates);
      await loadFeatures(); // Reload features list
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update feature';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  return {
    features,
    loading,
    error,
    createFeature,
    updateFeature,
    refreshFeatures: loadFeatures,
  };
};