import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { User, JwtPayload } from '../models/user.model';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    this.loadUserFromToken();
  }

  login(data: LoginRequest): Observable<void> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, data).pipe(
      tap(res => this.setSession(res.access_token)),
      tap(() => {
        const role = this.currentUser()?.role;
        this.router.navigate([role === 'admin' ? '/admin' : '/dashboard']);
      }),
      map(() => void 0)
    );
  }

  register(data: RegisterRequest): Observable<void> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(res => this.setSession(res.access_token)),
      tap(() => this.router.navigate(['/dashboard'])),
      map(() => void 0)
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  loadUserFromToken(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const payload = this.decodeToken(token);
    if (!payload) return;

    if (payload.exp * 1000 < Date.now()) {
      this.logout();
      return;
    }

    this.currentUser.set({ sub: payload.sub, email: payload.email, role: payload.role });
  }

  private setSession(token: string): void {
    localStorage.setItem('access_token', token);
    const payload = this.decodeToken(token);
    if (payload) {
      this.currentUser.set({ sub: payload.sub, email: payload.email, role: payload.role });
    }
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      if (!token || token.split('.').length < 2) {
        return null;
      }
      const base64Payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64Payload)) as JwtPayload;
    } catch (error) {
      console.error('JWT Decode failed:', error);
      return null;
    }
  }
}
