import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from './config';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private http = inject(HttpClient);
  private config = inject(API_CONFIG);
  get<T>(path: string, query: Record<string, string | number | undefined> = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') params = params.set(key, value);
    }
    return this.http.get<T>(`${this.config.baseUrl}${path}`, { params });
  }
  post<T>(path: string, body: unknown = {}) { return this.http.post<T>(`${this.config.baseUrl}${path}`, body); }
  patch<T>(path: string, body: unknown) { return this.http.patch<T>(`${this.config.baseUrl}${path}`, body); }
  delete(path: string) { return this.http.delete<void>(`${this.config.baseUrl}${path}`); }
}
