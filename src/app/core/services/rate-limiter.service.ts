import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RateLimitInfo {
  endpoint: string;
  lastCall: number;
  callCount: number;
  isBlocked: boolean;
  blockUntil?: number;
}

@Injectable({
  providedIn: 'root',
})
export class RateLimiterService {
  private rateLimits = new Map<string, RateLimitInfo>();
  private globalCallCount = 0;
  private lastGlobalReset = Date.now();

  // Rate limiting configuration - more lenient for better UX
  private readonly MAX_CALLS_PER_MINUTE = 100; // Increased from 30
  private readonly MAX_CALLS_PER_ENDPOINT = 40; // Increased from 10
  private readonly BLOCK_DURATION = 60000; // Reduced to 30 seconds
  private readonly RESET_INTERVAL = 60000; // 1 minute

  // Observable for rate limit status
  private rateLimitStatus = new BehaviorSubject<{
    isLimited: boolean;
    message?: string;
  }>({ isLimited: false });
  public rateLimitStatus$ = this.rateLimitStatus.asObservable();

  constructor() {
    // Reset global counter every minute
    setInterval(() => {
      this.resetGlobalCounter();
    }, this.RESET_INTERVAL);
  }

  /**
   * Check if an API call is allowed
   */
  canMakeCall(endpoint: string): boolean {
    const now = Date.now();

    // Reset global counter if needed
    if (now - this.lastGlobalReset > this.RESET_INTERVAL) {
      this.resetGlobalCounter();
    }

    // Check global rate limit
    if (this.globalCallCount >= this.MAX_CALLS_PER_MINUTE) {
      this.rateLimitStatus.next({
        isLimited: true,
        message: 'Too many requests. Please wait a moment.',
      });
      return false;
    }

    // Check endpoint-specific rate limit
    const endpointInfo = this.rateLimits.get(endpoint) || {
      endpoint,
      lastCall: 0,
      callCount: 0,
      isBlocked: false,
    };

    // Check if endpoint is blocked
    if (
      endpointInfo.isBlocked &&
      endpointInfo.blockUntil &&
      now < endpointInfo.blockUntil
    ) {
      this.rateLimitStatus.next({
        isLimited: true,
        message: `Rate limit exceeded for ${endpoint}. Please wait.`,
      });
      return false;
    }

    // Reset endpoint counter if block duration has passed
    if (
      endpointInfo.isBlocked &&
      endpointInfo.blockUntil &&
      now >= endpointInfo.blockUntil
    ) {
      endpointInfo.isBlocked = false;
      endpointInfo.callCount = 0;
      delete endpointInfo.blockUntil;
    }

    // Check endpoint call count
    if (endpointInfo.callCount >= this.MAX_CALLS_PER_ENDPOINT) {
      endpointInfo.isBlocked = true;
      endpointInfo.blockUntil = now + this.BLOCK_DURATION;
      this.rateLimits.set(endpoint, endpointInfo);

      this.rateLimitStatus.next({
        isLimited: true,
        message: `Rate limit exceeded for ${endpoint}. Please wait.`,
      });
      return false;
    }

    return true;
  }

  /**
   * Record an API call
   */
  recordCall(endpoint: string): void {
    const now = Date.now();

    // Update global counter
    this.globalCallCount++;

    // Update endpoint counter
    const endpointInfo = this.rateLimits.get(endpoint) || {
      endpoint,
      lastCall: 0,
      callCount: 0,
      isBlocked: false,
    };

    endpointInfo.lastCall = now;
    endpointInfo.callCount++;
    this.rateLimits.set(endpoint, endpointInfo);

    // Clear rate limit status if we're under limits
    this.rateLimitStatus.next({ isLimited: false });
  }

  /**
   * Record a failed call (429 error)
   */
  recordFailedCall(endpoint: string): void {
    const endpointInfo = this.rateLimits.get(endpoint) || {
      endpoint,
      lastCall: 0,
      callCount: 0,
      isBlocked: false,
    };

    // Block the endpoint for longer
    endpointInfo.isBlocked = true;
    endpointInfo.blockUntil = Date.now() + this.BLOCK_DURATION * 2; // 1 minute
    endpointInfo.callCount = this.MAX_CALLS_PER_ENDPOINT; // Set to max to prevent immediate retry

    this.rateLimits.set(endpoint, endpointInfo);

    this.rateLimitStatus.next({
      isLimited: true,
      message: `Rate limit exceeded for ${endpoint}. Please wait 1 minute.`,
    });
  }

  /**
   * Get remaining calls for an endpoint
   */
  getRemainingCalls(endpoint: string): number {
    const endpointInfo = this.rateLimits.get(endpoint);
    if (!endpointInfo) return this.MAX_CALLS_PER_ENDPOINT;

    if (endpointInfo.isBlocked) return 0;

    return Math.max(0, this.MAX_CALLS_PER_ENDPOINT - endpointInfo.callCount);
  }

  /**
   * Get global remaining calls
   */
  getGlobalRemainingCalls(): number {
    return Math.max(0, this.MAX_CALLS_PER_MINUTE - this.globalCallCount);
  }

  /**
   * Reset global counter
   */
  private resetGlobalCounter(): void {
    this.globalCallCount = 0;
    this.lastGlobalReset = Date.now();
    console.log('Rate limiter: Global counter reset');
  }

  /**
   * Get rate limit status for debugging
   */
  getRateLimitStatus(): any {
    return {
      global: {
        callCount: this.globalCallCount,
        maxCalls: this.MAX_CALLS_PER_MINUTE,
        remaining: this.getGlobalRemainingCalls(),
      },
      endpoints: Array.from(this.rateLimits.entries()).map(
        ([endpoint, info]) => ({
          endpoint,
          callCount: info.callCount,
          isBlocked: info.isBlocked,
          blockUntil: info.blockUntil,
          remaining: this.getRemainingCalls(endpoint),
        })
      ),
    };
  }
}
