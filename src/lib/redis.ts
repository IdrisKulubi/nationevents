import { redis } from './redis-fallback'

// Cache key prefixes for different data types
export const CACHE_KEYS = {
  USERS: 'user',
  JOBSEEKERS: 'jobseeker',
  EMPLOYERS: 'employer',
  EVENTS: 'event',
  BOOTHS: 'booth',
  ATTENDANCE: 'attendance',
  DASHBOARD_STATS: 'dashboard_stats',
  SECURITY: 'security',
  INTERVIEWS: 'interview',
  ANALYTICS: 'analytics',
  SESSION: 'session',
  REALTIME: 'realtime',
  QUEUE: 'queue',
} as const

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  IMMEDIATE: 60, // 1 minute - for frequently changing data
  SHORT: 300, // 5 minutes - for moderate frequency data
  MEDIUM: 1800, // 30 minutes - for relatively stable data
  LONG: 3600, // 1 hour - for stable data 
  VERY_LONG: 86400, // 24 hours - for rarely changing data
  DASHBOARD: 300, // 5 minutes for dashboard stats
  USER_SESSION: 1800, // 30 minutes for user sessions
  ANALYTICS: 3600, // 1 hour for analytics data
} as const

// Cache configuration for different data types
export const CACHE_CONFIG = {
  DASHBOARD_STATS: { ttl: CACHE_TTL.DASHBOARD, key: CACHE_KEYS.DASHBOARD_STATS },
  USER_PROFILE: { ttl: CACHE_TTL.MEDIUM, key: CACHE_KEYS.USERS },
  EVENT_LIST: { ttl: CACHE_TTL.LONG, key: CACHE_KEYS.EVENTS },
  EMPLOYER_LIST: { ttl: CACHE_TTL.MEDIUM, key: CACHE_KEYS.EMPLOYERS },
  JOBSEEKER_LIST: { ttl: CACHE_TTL.SHORT, key: CACHE_KEYS.JOBSEEKERS },
  BOOTH_ASSIGNMENTS: { ttl: CACHE_TTL.MEDIUM, key: CACHE_KEYS.BOOTHS },
  ATTENDANCE_STATS: { ttl: CACHE_TTL.SHORT, key: CACHE_KEYS.ATTENDANCE },
  SECURITY_INCIDENTS: { ttl: CACHE_TTL.SHORT, key: CACHE_KEYS.SECURITY },
  INTERVIEW_SLOTS: { ttl: CACHE_TTL.SHORT, key: CACHE_KEYS.INTERVIEWS },
  ANALYTICS_DATA: { ttl: CACHE_TTL.ANALYTICS, key: CACHE_KEYS.ANALYTICS },
} as const

/**
 * Advanced Cache Manager Class for High-Traffic Scenarios
 */
export class CacheManager {
  private redis: any

  constructor(redisClient: any) {
    this.redis = redisClient
  }

  /**
   * Generate cache key with pattern support
   */
  private generateKey(prefix: string, identifier: string): string {
    return `${prefix}:${identifier}`
  }

  /**
   * Set cache with TTL
   */
  async set<T>(
    prefix: string, 
    identifier: string, 
    data: T, 
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<void> {
    try {
      const key = this.generateKey(prefix, identifier)
      const serialized = JSON.stringify(data)
      await this.redis.setex(key, ttl, serialized)
    } catch (error) {
      console.error(`Cache set error for ${prefix}:${identifier}:`, error)
    }
  }

  /**
   * Get from cache
   */
  async get<T>(prefix: string, identifier: string): Promise<T | null> {
    try {
      const key = this.generateKey(prefix, identifier)
      const cached = await this.redis.get(key)
      
      if (!cached) return null
      return JSON.parse(cached as string) as T
    } catch (error) {
      console.error(`Cache get error for ${prefix}:${identifier}:`, error)
      return null
    }
  }

  /**
   * Delete specific cache entry
   */
  async delete(prefix: string, identifier: string): Promise<void> {
    try {
      const key = this.generateKey(prefix, identifier)
      await this.redis.del(key)
    } catch (error) {
      console.error(`Cache delete error for ${prefix}:${identifier}:`, error)
    }
  }

  /**
   * Get or Set pattern with fallback to database
   */
  async getOrSet<T>(
    prefix: string,
    identifier: string,
    fetchFunction: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM,
    forceRefresh: boolean = false
  ): Promise<T> {
    if (!forceRefresh) {
      const cached = await this.get<T>(prefix, identifier)
      if (cached !== null) {
        return cached
      }
    }

    // Fetch from database
    const data = await fetchFunction()
    await this.set(prefix, identifier, data, ttl)
    return data
  }

  /**
   * Invalidate cache by pattern (for bulk invalidation)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Upstash Redis REST API doesn't support KEYS command directly
      // We'll implement a tag-based invalidation system instead
      const tagsKey = `tags:${pattern}`
      const keys = await this.redis.smembers(tagsKey)
      
      if (keys.length > 0) {
        await this.redis.del(...keys)
        await this.redis.del(tagsKey)
      }
    } catch (error) {
      console.error(`Cache pattern invalidation error for ${pattern}:`, error)
    }
  }

  /**
   * Tag a cache entry for group invalidation
   */
  async tagKey(prefix: string, identifier: string, tag: string): Promise<void> {
    try {
      const key = this.generateKey(prefix, identifier)
      const tagsKey = `tags:${tag}`
      await this.redis.sadd(tagsKey, key)
    } catch (error) {
      console.error(`Cache tagging error for ${prefix}:${identifier}:`, error)
    }
  }

  /**
   * Increment counter with expiration
   */
  async increment(
    prefix: string, 
    identifier: string, 
    increment: number = 1,
    ttl: number = CACHE_TTL.SHORT
  ): Promise<number> {
    try {
      const key = this.generateKey(prefix, identifier)
      const result = await this.redis.incrby(key, increment)
      await this.redis.expire(key, ttl)
      return result
    } catch (error) {
      console.error(`Cache increment error for ${prefix}:${identifier}:`, error)
      return 0
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Cache health check failed:', error)
      return false
    }
  }

  /**
   * Rate limiting functionality
   */
  async rateLimit(
    key: string, 
    limit: number, 
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const rateLimitKey = `ratelimit:${key}`
      const current = await this.redis.incr(rateLimitKey)
      
      if (current === 1) {
        await this.redis.expire(rateLimitKey, windowSeconds)
      }
      
      const ttl = await this.redis.ttl(rateLimitKey)
      const resetTime = Date.now() + (ttl * 1000)
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime
      }
    } catch (error) {
      console.error(`Rate limit error for ${key}:`, error)
      return { allowed: true, remaining: limit, resetTime: Date.now() + windowSeconds * 1000 }
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager(redis)

// Helper functions for common cache operations
export async function getCached<T>(
  prefix: string, 
  identifier: string
): Promise<T | null> {
  return cacheManager.get<T>(prefix, identifier)
}

export async function setCached<T>(
  prefix: string, 
  identifier: string, 
  data: T, 
  ttl?: number
): Promise<void> {
  return cacheManager.set(prefix, identifier, data, ttl)
}

export async function deleteCached(
  prefix: string, 
  identifier: string
): Promise<void> {
  return cacheManager.delete(prefix, identifier)
}

export async function invalidatePatternCached(pattern: string): Promise<void> {
  return cacheManager.invalidatePattern(pattern)
}

/**
 * Cache decorator for functions
 */
export function withCache<T extends any[], R>(
  cacheKey: (args: T) => string,
  ttl: number = CACHE_TTL.MEDIUM,
  prefix: string = 'fn'
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: T): Promise<R> {
      const key = cacheKey(args)
      
      // Try to get from cache first
      const cached = await getCached<R>(prefix, key)
      if (cached !== null) {
        return cached
      }

      // Execute original function
      const result = await method.apply(this, args)
      
      // Cache the result
      await setCached(prefix, key, result, ttl)
      
      return result
    }
  }
} 