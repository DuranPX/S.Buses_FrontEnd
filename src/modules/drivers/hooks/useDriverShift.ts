import { useState, useEffect, useCallback } from 'react';
import { driverMockService } from '../services/driverMockService';
import type { DriverShift, BusCondition } from '../types/driver.types';

export const useDriverShift = () => {
  const [shift, setShift] = useState<DriverShift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchShift = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await driverMockService.getCurrentShift();
      setShift(data);
    } catch {
      setError('Error al cargar el turno del conductor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchShift(); }, [fetchShift]);

  const startShift = async (condition: BusCondition) => {
    if (!shift) return false;
    setIsProcessing(true);
    setError(null);
    try {
      const updated = await driverMockService.startShift(shift.id, condition);
      setShift(updated);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar turno.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const endShift = async () => {
    if (!shift) return false;
    setIsProcessing(true);
    try {
      await driverMockService.endShift(shift.id);
      setShift(null); // Clear active shift
      return true;
    } catch {
      setError('Error al finalizar turno.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { shift, isLoading, error, isProcessing, startShift, endShift, refetch: fetchShift };
};
