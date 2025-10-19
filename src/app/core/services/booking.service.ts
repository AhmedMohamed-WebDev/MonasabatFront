// src/app/core/services/booking.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, CancelBookingResponse } from '../models/booking.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl =
    (environment.apiUrl || 'http://localhost:5000/api').replace(/\/+$/, '') +
    '/bookings';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my-bookings`, {
      headers: this.getAuthHeaders(),
    });
  }

  cancelBooking(bookingId: string): Observable<CancelBookingResponse> {
    return this.http.patch<CancelBookingResponse>(
      `${this.apiUrl}/${bookingId}/cancel`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  updateBookingStatus(
    bookingId: string,
    status: 'confirmed' | 'cancelled'
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${bookingId}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }
}
