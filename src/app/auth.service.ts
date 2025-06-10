import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9091/auth'; // Base API URL for authentication

  constructor(private http: HttpClient) {}

  // Get authentication headers
  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('JWT token is missing in localStorage.');
      alert('You are not authenticated. Please log in.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // Attach JWT token to Authorization header
    });
  }

  // Register a new user
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/new`, userData, { responseType: 'text' });
  }

  // Authenticate a user (login)
  loginUser(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate`, loginData, { responseType: 'text' });
  }

  // Decode JWT token
  decodeJwtToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  // Store user data in localStorage
  storeUserData(token: string): void {
    const decodedToken = this.decodeJwtToken(token);
    if (decodedToken) {
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('username', decodedToken.sub);
      localStorage.setItem('userId', decodedToken.userId);
      localStorage.setItem('roles', decodedToken.roles);
      localStorage.setItem('isLoggedIn', 'true');
    }
  }

  // Clear user data from localStorage
  clearUserData(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('roles');
    localStorage.removeItem('isLoggedIn');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwtToken');
  }
}