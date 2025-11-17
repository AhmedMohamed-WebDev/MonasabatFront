import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private base = `${environment.apiUrl}/event-items`;

  constructor(private http: HttpClient) {}

  getSummary(serviceId: string): Observable<any> {
    return this.http.get(`${this.base}/${serviceId}/ratings/summary`);
  }

  getRatings(serviceId: string, page = 1, limit = 20): Observable<any> {
    return this.http.get(`${this.base}/${serviceId}/ratings/list`, {
      params: { page: String(page), limit: String(limit) },
    });
  }

  submitRating(
    serviceId: string,
    score: number,
    comment?: string
  ): Observable<any> {
    return this.http.post(`${this.base}/${serviceId}/ratings`, {
      score,
      comment,
    });
  }

  checkEligibility(serviceId: string): Observable<any> {
    return this.http.get(`${this.base}/${serviceId}/ratings/eligible`);
  }

  getMyRating(serviceId: string): Observable<any> {
    return this.http.get(`${this.base}/${serviceId}/ratings/my`);
  }
}
