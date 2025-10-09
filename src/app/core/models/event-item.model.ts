export interface EventItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
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
}

export interface CreateEventItemRequest {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
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
}

export interface UpdateEventItemRequest
  extends Partial<CreateEventItemRequest> {
  images?: string[];
  videos?: string[];
}
