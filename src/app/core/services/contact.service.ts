import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  ContactMessage,
  ContactResponse,
  ContactRequest,
  ContactRequestResponse,
  ContactLimitInfo,
} from '../models/contact.model';
import { RateLimiterService } from './rate-limiter.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact-request`;

  constructor(
    private http: HttpClient,
    private rateLimiter: RateLimiterService
  ) {}

  sendMessage(message: ContactMessage): Observable<ContactResponse> {
    const endpoint = '/contact-request';

    if (!this.rateLimiter.canMakeCall(endpoint)) {
      return throwError(
        () =>
          new Error(
            'Rate limit exceeded. Please wait before making more requests.'
          )
      );
    }

    this.rateLimiter.recordCall(endpoint);

    return this.http.post<ContactResponse>(this.apiUrl, message).pipe(
      catchError((error) => {
        if (error.status === 429) {
          this.rateLimiter.recordFailedCall(endpoint);
        }
        return throwError(() => error);
      })
    );
  }

  // New methods for contact requests
  sendContactRequest(
    request: Omit<ContactRequest, '_id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Observable<ContactRequestResponse> {
    const endpoint = '/contact-request/request';

    if (!this.rateLimiter.canMakeCall(endpoint)) {
      return throwError(
        () =>
          new Error(
            'Rate limit exceeded. Please wait before making more requests.'
          )
      );
    }

    this.rateLimiter.recordCall(endpoint);

    return this.http
      .post<ContactRequestResponse>(`${this.apiUrl}/request`, request)
      .pipe(
        catchError((error) => {
          if (error.status === 429) {
            this.rateLimiter.recordFailedCall(endpoint);
          }
          return throwError(() => error);
        })
      );
  }

  // Get contact requests for suppliers
  getContactRequests(): Observable<ContactRequest[]> {
    const endpoint = '/contact-request/requests';

    if (!this.rateLimiter.canMakeCall(endpoint)) {
      return throwError(
        () =>
          new Error(
            'Rate limit exceeded. Please wait before making more requests.'
          )
      );
    }

    this.rateLimiter.recordCall(endpoint);

    return this.http.get<ContactRequest[]>(`${this.apiUrl}/requests`).pipe(
      catchError((error) => {
        if (error.status === 429) {
          this.rateLimiter.recordFailedCall(endpoint);
        }
        return throwError(() => error);
      })
    );
  }

  // Get contact requests for clients
  getClientContactRequests(): Observable<ContactRequest[]> {
    const endpoint = '/contact-request/client-requests';

    if (!this.rateLimiter.canMakeCall(endpoint)) {
      return throwError(
        () =>
          new Error(
            'Rate limit exceeded. Please wait before making more requests.'
          )
      );
    }

    this.rateLimiter.recordCall(endpoint);

    return this.http
      .get<ContactRequest[]>(`${this.apiUrl}/client-requests`)
      .pipe(
        catchError((error) => {
          if (error.status === 429) {
            this.rateLimiter.recordFailedCall(endpoint);
          }
          return throwError(() => error);
        })
      );
  }

  getContactLimitInfo(): Observable<ContactLimitInfo> {
    const endpoint = '/contact-request/limit-info';

    if (!this.rateLimiter.canMakeCall(endpoint)) {
      return throwError(
        () =>
          new Error(
            'Rate limit exceeded. Please wait before making more requests.'
          )
      );
    }

    this.rateLimiter.recordCall(endpoint);

    return this.http.get<ContactLimitInfo>(`${this.apiUrl}/limit-info`).pipe(
      catchError((error) => {
        if (error.status === 429) {
          this.rateLimiter.recordFailedCall(endpoint);
        }
        return throwError(() => error);
      })
    );
  }

  updateContactRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected'
  ): Observable<ContactRequestResponse> {
    const endpoint = `/contact-request/requests/${requestId}`;

    if (!this.rateLimiter.canMakeCall(endpoint)) {
      return throwError(
        () =>
          new Error(
            'Rate limit exceeded. Please wait before making more requests.'
          )
      );
    }

    this.rateLimiter.recordCall(endpoint);

    return this.http
      .patch<ContactRequestResponse>(`${this.apiUrl}/requests/${requestId}`, {
        status,
      })
      .pipe(
        catchError((error) => {
          if (error.status === 429) {
            this.rateLimiter.recordFailedCall(endpoint);
          }
          return throwError(() => error);
        })
      );
  }

  // Convert a quoted contact request into a booking
  convertContactRequest(
    requestId: string,
    payload: {
      eventDate: string;
      numberOfPeople?: number;
      publishPrice?: boolean;
    }
  ): Observable<any> {
    const endpoint = `/contact-request/requests/${requestId}/convert`;

    if (!this.rateLimiter.canMakeCall(endpoint)) {
      return throwError(
        () =>
          new Error(
            'Rate limit exceeded. Please wait before making more requests.'
          )
      );
    }

    this.rateLimiter.recordCall(endpoint);

    return this.http
      .post<any>(`${this.apiUrl}/requests/${requestId}/convert`, payload)
      .pipe(
        catchError((error) => {
          if (error.status === 429) {
            this.rateLimiter.recordFailedCall(endpoint);
          }
          return throwError(() => error);
        })
      );
  }

  // Check contact request status between client and supplier
  checkContactRequestStatus(
    clientId: string,
    supplierId: string,
    serviceId: string
  ): Observable<any> {
    const endpoint = '/contact-request/check-status';

    if (!this.rateLimiter.canMakeCall(endpoint)) {
      return throwError(
        () =>
          new Error(
            'Rate limit exceeded. Please wait before making more requests.'
          )
      );
    }

    this.rateLimiter.recordCall(endpoint);

    return this.http
      .get<any>(`${this.apiUrl}/check-status`, {
        params: { clientId, supplierId, serviceId },
      })
      .pipe(
        catchError((error) => {
          if (error.status === 429) {
            this.rateLimiter.recordFailedCall(endpoint);
          }
          return throwError(() => error);
        })
      );
  }
}
