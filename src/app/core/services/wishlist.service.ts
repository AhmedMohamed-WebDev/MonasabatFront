import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private baseUrl = `${environment.apiUrl}/wishlist`;
  // Reactive wishlist state
  private idsSubject = new BehaviorSubject<string[]>([]);
  public wishlistIds$ = this.idsSubject.asObservable();

  private countSubject = new BehaviorSubject<number>(0);
  public wishlistCount$ = this.countSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Toggle wishlist (add or remove)
  toggleWishlist(serviceId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/toggle`, { serviceId }).pipe(
      tap((resp: any) => {
        // resp: { added: boolean, message?: string }
        const current = [...this.idsSubject.value];
        if (resp && typeof resp.added === 'boolean') {
          if (resp.added) {
            if (!current.includes(serviceId)) current.push(serviceId);
          } else {
            const idx = current.indexOf(serviceId);
            if (idx > -1) current.splice(idx, 1);
          }
          this.idsSubject.next(current);
          this.countSubject.next(current.length);
        }
      }),
      catchError((err) => {
        console.warn('Wishlist toggle failed', err);
        return of(err);
      })
    );
  }

  // Get user's complete wishlist
  getWishlist(): Observable<any> {
    return this.http.get(`${this.baseUrl}`).pipe(
      tap((res: any) => {
        const services = res?.services || [];
        const ids = Array.isArray(services)
          ? services.map((s: any) => s._id)
          : [];
        this.idsSubject.next(ids);
        this.countSubject.next(ids.length);
      })
    );
  }

  // Check if a service is in wishlist
  checkWishlistStatus(serviceId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/check/${serviceId}`);
  }

  // Check multiple services at once
  checkWishlistStatuses(serviceIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/check-multiple`, { serviceIds });
  }

  // Add to wishlist
  addToWishlist(serviceId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, { serviceId }).pipe(
      tap(() => {
        const current = [...this.idsSubject.value];
        if (!current.includes(serviceId)) {
          current.push(serviceId);
          this.idsSubject.next(current);
          this.countSubject.next(current.length);
        }
      }),
      catchError((err) => {
        console.warn('Add to wishlist failed', err);
        return of(err);
      })
    );
  }

  // Remove from wishlist
  removeFromWishlist(serviceId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${serviceId}`).pipe(
      tap(() => {
        const current = [...this.idsSubject.value];
        const idx = current.indexOf(serviceId);
        if (idx > -1) {
          current.splice(idx, 1);
          this.idsSubject.next(current);
          this.countSubject.next(current.length);
        }
      }),
      catchError((err) => {
        console.warn('Remove from wishlist failed', err);
        return of(err);
      })
    );
  }

  // Force-refresh wishlist from server
  refreshWishlist(): void {
    this.getWishlist().subscribe({ next: () => {}, error: () => {} });
  }
}
