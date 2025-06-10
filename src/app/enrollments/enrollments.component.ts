import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-enrollments',
  imports: [CommonModule,RouterLink],
  templateUrl: './enrollments.component.html',
  styleUrls: ['./enrollments.component.css']
})
export class EnrollmentsComponent implements OnInit {
  enrollments: any[] = [];
  courseEnrollmentCounts: { courseId: number; count: number }[] = []; // Array to store course IDs and their counts
  private apiUrl = 'http://localhost:9091/enrollment';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.hasRole('STUDENT')) {
      this.fetchStudentEnrollments();
    } else if (this.hasRole('ADMIN')) {
      this.fetchAllEnrollments();
    }
  }

  // Fetch enrollments for the logged-in student
  fetchStudentEnrollments(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.http.get(`${this.apiUrl}/getByUserId/${userId}`, { headers: this.getAuthHeaders() }).subscribe({
        next: (response: any) => {
          this.enrollments = response;
          console.log('Student Enrollments:', this.enrollments); // Debug log
        },
        error: (error: any) => {
          console.error('Error fetching student enrollments:', error);
          alert('Failed to load enrollments. Please try again later.');
        }
      });
    } else {
      alert('You are not authenticated. Please log in.');
    }
  }

  // Fetch all enrollments for admin and calculate enrollment counts per course
  fetchAllEnrollments(): void {
    this.http.get(`${this.apiUrl}/getAll`, { headers: this.getAuthHeaders() }).subscribe({
      next: (response: any) => {
        this.enrollments = response;
        console.log('All Enrollments:', this.enrollments); // Debug log

        // Calculate enrollment counts per course
        const counts: { [courseId: number]: number } = {};
        this.enrollments.forEach((enrollment: any) => {
          counts[enrollment.courseId] = (counts[enrollment.courseId] || 0) + 1;
        });

        // Convert the counts object into an array for easier use in the template
        this.courseEnrollmentCounts = Object.keys(counts).map(courseId => ({
          courseId: Number(courseId),
          count: counts[Number(courseId)]
        }));

        console.log('Course Enrollment Counts:', this.courseEnrollmentCounts); // Debug log
      },
      error: (error: any) => {
        console.error('Error fetching all enrollments:', error);
        alert('Failed to load enrollments. Please try again later.');
      }
    });
  }

  // Method to check the user's role
  hasRole(role: string): boolean {
    const roles = localStorage.getItem('roles');
    return roles ? roles.split(',').includes(role) : false;
  }

  // Method to get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('JWT token is missing in localStorage.');
      alert('You are not authenticated. Please log in.');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}` // Attach JWT token to Authorization header
    });
  }
}