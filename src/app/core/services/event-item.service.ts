// src/app/core/services/event-item.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EventItem,
  CreateEventItemRequest,
  UpdateEventItemRequest,
} from '../models/event-item.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventItemService {
  private apiUrl = `${environment.apiUrl}/event-items`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Get single event item
  getEventItemById(id: string): Observable<EventItem> {
    return this.http.get<EventItem>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Create new event item
  createEventItem(data: CreateEventItemRequest): Observable<EventItem> {
    return this.http.post<EventItem>(this.apiUrl, data, {
      headers: this.getAuthHeaders(),
    });
  }

  // Update event item
  updateEventItem(
    id: string,
    data: UpdateEventItemRequest
  ): Observable<EventItem> {
    return this.http.put<EventItem>(`${this.apiUrl}/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  // Delete event item
  deleteEventItem(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Upload media
  uploadEventMedia(eventId: string, formData: FormData): Observable<EventItem> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
    return this.http.post<EventItem>(
      `${this.apiUrl}/${eventId}/upload-media`,
      formData,
      {
        headers,
      }
    );
  }
}
