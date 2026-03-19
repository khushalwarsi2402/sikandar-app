import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { apiConfig } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  // Use environment apiConfig so tests and environment settings stay consistent
 private apiUrl = `${apiConfig.apiUrl}/api/inventory`;

  constructor(private http: HttpClient) {}

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError((error) => {
        // Log the error for debugging, then pass it down to the component
        console.error('Service error:', error);
        return throwError(() => new Error('Failed to fetch inventory from server'));
      })
    );
  }
}