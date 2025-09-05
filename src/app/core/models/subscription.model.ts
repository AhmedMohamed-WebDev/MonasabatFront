// Should update frontend model to match backend
export interface SupplierSubscription {
  _id: string;
  supplier: string;
  type: 'basic' | 'premium' | 'enterprise'; // Changed from 'plan' to 'type' to match backend
  startDate: string;
  expiryDate: string; // Changed from 'endDate' to 'expiryDate' to match backend
  status: 'active' | 'expired' | 'cancelled';
  paymentId?: string;
  amount?: number;
  autoRenew: boolean; // Added to match backend
  createdAt?: string;
  updatedAt?: string;
}

// export interface SubscriptionStats {
//   isLocked: boolean;
//   lockReason?: string;
//   lockExpiryDate?: string;
//   usagePercentage: number;
//   daysUntilExpiry: number;
//   hasWarning: boolean;
//   warningType?: 'near-limit' | 'expiring' | 'locked';
//   currentContacts: number; // Added to match backend
//   maxContacts: number; // Added to match backend
// }

export interface SubscriptionStats {
  isLocked: boolean;
  lockReason?: string;
  lockExpiryDate?: string;
  usagePercentage: number;
  daysUntilExpiry: number;
  hasWarning: boolean;
  warnings: string[]; // Add this new field
  warningType?: 'near-limit' | 'expiring' | 'locked';
  currentContacts: number;
  maxContacts: number;
}
// New interfaces for subscription management
export interface SubscriptionPlan {
  type: 'basic' | 'premium' | 'enterprise';
  name: string;
  price: number;
  contactLimit: number;
  features: string[];
}

export interface RenewSubscriptionRequest {
  planType: 'basic' | 'premium' | 'enterprise';
}

export interface RenewSubscriptionResponse {
  success: boolean;
  message: string;
  subscription?: SupplierSubscription;
}
