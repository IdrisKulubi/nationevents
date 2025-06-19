/**
 * Redis Fallback Implementation
 * Used when Redis is not available or during build time
 */

// Mock Redis implementation for fallback
class MockRedis {
  private store = new Map<string, { value: any; expiry?: number }>()

  async ping(): Promise<string> {
    return 'PONG'
  }

  async setex(key: string, ttl: number, value: string): Promise<void> {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttl * 1000
    })
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key)
    if (!item) return null
    
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key)
      return null
    }
    
    return item.value
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0
    keys.forEach(key => {
      if (this.store.delete(key)) deleted++
    })
    return deleted
  }

  async smembers(key: string): Promise<string[]> {
    const item = this.store.get(key)
    return item?.value || []
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    const existing = this.store.get(key)?.value || []
    const newMembers = [...new Set([...existing, ...members])]
    this.store.set(key, { value: newMembers })
    return members.length
  }

  async incrby(key: string, increment: number): Promise<number> {
    const existing = this.store.get(key)
    const currentValue = existing?.value || 0
    const newValue = currentValue + increment
    this.store.set(key, { value: newValue, expiry: existing?.expiry })
    return newValue
  }

  async incr(key: string): Promise<number> {
    return this.incrby(key, 1)
  }

  async expire(key: string, seconds: number): Promise<void> {
    const existing = this.store.get(key)
    if (existing) {
      this.store.set(key, {
        ...existing,
        expiry: Date.now() + seconds * 1000
      })
    }
  }

  async ttl(key: string): Promise<number> {
    const item = this.store.get(key)
    if (!item?.expiry) return -1
    const remaining = Math.max(0, item.expiry - Date.now())
    return Math.ceil(remaining / 1000)
  }
}

/**
 * Create Redis client with fallback
 */
export function createRedisClient() {
  try {
    //eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require('@upstash/redis')
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  } catch (error) {
    console.warn('Redis not available, using fallback implementation:', error instanceof Error ? error.message : String(error))
    return new MockRedis()
  }
}

export const redis = createRedisClient() 