/**
 * Data Prefetching Service - Preloads critical dashboard data
 */
import { backendAPI } from '@/lib/backend-api'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class DataPrefetchService {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private prefetchPromises: Map<string, Promise<any>> = new Map()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Clear cache entry
   */
  clear(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear()
    this.prefetchPromises.clear()
  }

  /**
   * Prefetch data with caching and deduplication
   */
  async prefetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Check if already fetching
    const existingPromise = this.prefetchPromises.get(key)
    if (existingPromise) {
      return existingPromise as Promise<T>
    }

    // Start fetching
    const promise = fetchFn()
      .then((data) => {
        this.set(key, data, ttl)
        this.prefetchPromises.delete(key)
        return data
      })
      .catch((error) => {
        this.prefetchPromises.delete(key)
        throw error
      })

    this.prefetchPromises.set(key, promise)
    return promise
  }

  /**
   * Prefetch all dashboard data in parallel
   */
  async prefetchDashboard(userId: string): Promise<void> {
    // Skip prefetch if backend is not healthy (fast check with cache)
    try {
      const healthy = await backendAPI.isHealthy()
      if (!healthy) {
        return
      }
    } catch {
      return
    }

    const prefetchTasks = [
      // Accounts
      this.prefetch(
        `accounts:${userId}`,
        () => backendAPI.getAccounts(userId),
        5 * 60 * 1000 // 5 minutes
      ),
      this.prefetch(
        `accounts-summary:${userId}`,
        () => backendAPI.getAccountsSummary(userId),
        5 * 60 * 1000
      ),
      
      // Transactions
      this.prefetch(
        `transactions:${userId}`,
        () => backendAPI.getTransactions(userId, { limit: 20 }),
        2 * 60 * 1000 // 2 minutes
      ),
      this.prefetch(
        `transactions-stats:${userId}`,
        () => backendAPI.getTransactionStats(userId),
        2 * 60 * 1000
      ),
      this.prefetch(
        `transactions-recommendations:${userId}`,
        () => backendAPI.getTransactionRecommendations(userId),
        5 * 60 * 1000
      ),
      
      // Savings
      this.prefetch(
        `savings-summary:${userId}`,
        () => backendAPI.getSavingsSummary(userId),
        5 * 60 * 1000
      ),
      
      // AI Insights
      this.prefetch(
        `ai-insights:${userId}`,
        () => backendAPI.getComprehensiveInsights(userId),
        10 * 60 * 1000 // 10 minutes - insights can be cached longer
      ),
      
      // Privacy
      this.prefetch(
        `privacy-score:${userId}`,
        () => backendAPI.getPrivacyScore(userId),
        10 * 60 * 1000
      ),
    ]

    // Execute all prefetches in parallel, ignore errors
    Promise.allSettled(prefetchTasks).catch((error) => {
      console.error('Dashboard prefetch error:', error)
    })
  }

  /**
   * Prefetch data when user hovers over dashboard link
   */
  async prefetchOnHover(userId: string): Promise<void> {
    // Only prefetch if not already cached
    const hasCachedData = 
      this.get(`accounts:${userId}`) !== null ||
      this.get(`transactions:${userId}`) !== null
    
    if (!hasCachedData) {
      this.prefetchDashboard(userId)
    }
  }
}

// Export singleton instance
export const dataPrefetchService = new DataPrefetchService()

