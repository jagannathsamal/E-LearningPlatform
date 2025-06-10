import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:9091/course'; // Base API URL

  constructor(private http: HttpClient) {}

  // Get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('JWT token is missing in localStorage.');
      alert('You are not authenticated. Please log in.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // Attach JWT token to Authorization header
    });
  }

  // Load all courses
  loadCourses(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/getAll`, { headers, responseType: 'json' });
  }

  // Add a new course
  addCourse(courseData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/save`, courseData, { headers, responseType: 'text' });
  }

  // Update an existing course
  updateCourse(courseData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/update`, courseData, { headers, responseType: 'text' });
  }

  // Delete a course
  deleteCourse(courseId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/delete/${courseId}`, { headers, responseType: 'text' });
  }

  // Enroll in a course
  enrollInCourse(enrollmentData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post('http://localhost:9091/enrollment/save', enrollmentData, { headers, responseType: 'text' });
  }

  // Get enrollments for a course
  getEnrollmentsByCourseId(courseId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`http://localhost:9091/enrollment/getByCourseId/${courseId}`, { headers, responseType: 'json' });
  }
}