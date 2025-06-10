import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:9091/quiz'; // Base API URL for quizzes

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

  // Fetch quizzes by course ID
  getQuizzesByCourseId(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getQuizByCourseId/${courseId}`, { headers: this.getAuthHeaders() });
  }

  // Fetch quiz by ID
  getQuizById(quizId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getById/${quizId}`, { headers: this.getAuthHeaders() });
  }

  // Save a new quiz
  saveQuiz(quizData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, quizData, { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  // Update an existing quiz
  updateQuiz(quizData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, quizData, { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  // Delete a quiz by ID
  deleteQuizById(quizId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteById/${quizId}`, { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  // Submit quiz responses
  submitQuiz(submissionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, submissionData, { headers: this.getAuthHeaders(), responseType: 'text' });
  }
}