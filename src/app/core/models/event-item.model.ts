export interface EventItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  // Optional price: may be null when supplier didn't provide a price
  price?: number | null;
  // Optional currency code, e.g. 'JOD'
  priceCurrency?: string;
  // Price type to clarify meaning when price is missing or variable
  priceType?: 'fixed' | 'from' | 'negotiable' | 'free' | 'not_provided';
  // Convenience flag for consumers
  priceAvailable?: boolean;
  minCapacity: number;
  maxCapacity: number;
  location: {
    city: string;
    area: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availableDates?: Date[];
  availability: {
    dateRange: {
      from: Date;
      to: Date;
    };
    excludedDates?: Date[]; // Optional: for specific dates to exclude
  };
  supplier: {
    _id: string;
    name: string;
    phone: string;
  };
  images?: string[];
  videos?: string[];
  social?: {
    instagram?: string;
    facebook?: string;
  };
}

export interface CreateEventItemRequest {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  // price optional on create to allow contact-only services
  price?: number | null;
  priceType?: 'fixed' | 'from' | 'negotiable' | 'free' | 'not_provided';
  priceAvailable?: boolean;
  location: {
    city?: string;
    area?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  availableDates?: string[];
  availability: {
    dateRange: {
      from: string;
      to: string;
    };
    excludedDates?: string[];
  };
  minCapacity?: number;
  maxCapacity?: number;
  social?: {
    instagram?: string;
    facebook?: string;
  };
}

export interface UpdateEventItemRequest
  extends Partial<CreateEventItemRequest> {
  images?: string[];
  videos?: string[];
}
