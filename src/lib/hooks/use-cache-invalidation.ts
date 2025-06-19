"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook for cache invalidation and data refreshing
 * Provides utilities to invalidate specific cache patterns and refresh data
 */
export function useCacheInvalidation() {
  const router = useRouter();

  /**
   * Invalidate dashboard cache and refresh data
   */
  const refreshDashboard = useCallback(async () => {
    const response = await fetch('/api/admin/dashboard-stats', {
      method: 'POST',
    });
    return response.json();
  }, []);

  /**
   * Invalidate specific cache pattern
   */
  const invalidateCache = useCallback(async (pattern: string) => {
    try {
      const response = await fetch(`/api/admin/cache/health?pattern=${encodeURIComponent(pattern)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to invalidate cache pattern: ${pattern}`);
      }

      // Refresh the current page
      router.refresh();
      
      return await response.json();
    } catch (error) {
      console.error(`Error invalidating cache pattern ${pattern}:`, error);
      throw error;
    }
  }, [router]);

  /**
   * Clear all caches (use with extreme caution)
   */
  const clearAllCaches = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/cache/health?all=true', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear all caches');
      }

      // Refresh the current page
      router.refresh();
      
      return await response.json();
    } catch (error) {
      console.error('Error clearing all caches:', error);
      throw error;
    }
  }, [router]);

  /**
   * Get cache health status
   */
  const getCacheHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/cache/health');

      if (!response.ok) {
        throw new Error('Failed to get cache health');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting cache health:', error);
      throw error;
    }
  }, []);

  /**
   * Refresh specific data type
   */
  const refreshData = useCallback(async (dataType: 'users' | 'employers' | 'events' | 'jobseekers') => {
    try {
      await invalidateCache(dataType);
      return { success: true, message: `${dataType} data refreshed successfully` };
    } catch (error) {
      console.error(`Error refreshing ${dataType} data:`, error);
      throw error;
    }
  }, [invalidateCache]);

  return {
    refreshDashboard,
    invalidateCache,
    clearAllCaches,
    getCacheHealth,
    refreshData,
  };
}

/**
 * Hook for real-time cache monitoring
 */
export function useCacheMonitoring() {
  const { getCacheHealth } = useCacheInvalidation();

  /**
   * Monitor cache performance
   */
  const monitorCache = useCallback(async () => {
    try {
      const health = await getCacheHealth();
      
      // Check if cache is performing well
      const isHealthy = health.status === 'healthy';
      const hitRate = parseFloat(health.performance?.hitRate?.replace('%', '') || '0');
      const isPerformant = hitRate > 80; // Consider > 80% hit rate as good performance

      return {
        ...health,
        isHealthy,
        isPerformant,
        recommendations: generateRecommendations(health),
      };
    } catch (error) {
      console.error('Error monitoring cache:', error);
      return {
        isHealthy: false,
        isPerformant: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: ['Check Redis connection', 'Verify cache configuration'],
      };
    }
  }, [getCacheHealth]);

  return {
    monitorCache,
  };
}

/**
 * Generate performance recommendations based on cache health
 */
function generateRecommendations(health: any): string[] {
  const recommendations: string[] = [];

  if (health.performance?.hitRate) {
    const hitRate = parseFloat(health.performance.hitRate.replace('%', ''));
    
    if (hitRate < 70) {
      recommendations.push('Consider increasing cache TTL for frequently accessed data');
      recommendations.push('Review cache keys for optimization opportunities');
    }
    
    if (hitRate < 50) {
      recommendations.push('Cache hit rate is low - review caching strategy');
      recommendations.push('Consider implementing cache warming for critical data');
    }
  }

  if (health.status !== 'healthy') {
    recommendations.push('Check Redis connection and server status');
    recommendations.push('Verify Upstash Redis configuration');
  }

  if (health.memoryUsage?.heapUsed && health.memoryUsage?.heapTotal) {
    const memoryUsage = (health.memoryUsage.heapUsed / health.memoryUsage.heapTotal) * 100;
    
    if (memoryUsage > 80) {
      recommendations.push('High memory usage detected - consider cache cleanup');
      recommendations.push('Review cache TTL settings to free up memory');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Cache is performing optimally');
  }

  return recommendations;
} 