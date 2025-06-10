import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
 
@Component({
  selector: 'app-quizlist',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './quizlist.component.html',
  styleUrls: ['./quizlist.component.css']
})
export class QuizlistComponent implements OnInit {
  quizzes: any[] = []; // Store quizzes
  courseId: number | null = null; // Store courseId
 
  constructor(private route: ActivatedRoute, private http: HttpClient,private router:Router) {}
 
  ngOnInit(): void {
    // Retrieve courseId from route parameters
    this.courseId = +this.route.snapshot.params['courseId'];
    console.log('Retrieved courseId:', this.courseId); // Debug log
 
    if (this.courseId) {
      // Fetch quizzes for the courseId
      this.loadQuizzes();
    } else {
      console.error('Invalid courseId received in quizlist.');
      alert('Invalid course ID. Unable to fetch quizzes.');
    }
  }
 
  loadQuizzes(): void {
    console.log('Fetching quizzes for courseId:', this.courseId); // Debug log before fetching quizzes
    this.http.get(`http://localhost:9091/quiz/getQuizByCourseId/${this.courseId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (response: any) => {
        console.log('Quizzes fetched:', response); // Debug log for fetched quizzes
        this.quizzes = response; // Store quizzes
        if (this.quizzes.length === 0) {
          console.warn('No quizzes found for courseId:', this.courseId);
        }
      },
      error: (error: any) => {
        console.error('Error fetching quizzes:', error);
        alert('Failed to load quizzes. Please try again later.');
      }
    });
  }
 
  onAttemptQuiz(quizId: number): void {
    const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
    const courseId = this.courseId; // Use the courseId from the current component
    this.router.navigate(['/quizattempt', quizId, courseId, userId]); // Navigate to QuizAttemptComponent
  }
 
  hasRole(role: string): boolean {
    // Replace this with your actual role-checking logic
    const userRoles = localStorage.getItem('roles')?.split(',') || [];
    return userRoles.includes(role);
  }
 
  onUpdateQuiz(quizId: number): void {
    console.log('Navigating to update quiz with ID:', quizId); // Debug log
    this.router.navigate(['/updatequiz', quizId]); // Navigate to AddQuizComponent with quizId
  }
 
  onDeleteQuiz(quizId: number): void {
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      console.log('Deleting quiz with ID:', quizId); // Debug log
      this.http.delete(`http://localhost:9091/quiz/deleteById/${quizId}`, { headers: this.getAuthHeaders(),responseType:'text'}).subscribe({
        next: () => {
          console.log('Quiz deleted successfully:', quizId); // Debug log
          alert('Quiz deleted successfully!');
          this.loadQuizzes(); // Reload the quizzes after deletion
        },
        error: (error: any) => {
          console.error('Error deleting quiz:', error); // Debug log
          alert('Failed to delete quiz. Please try again later.');
        }
      });
    }
  }
 
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
}
 