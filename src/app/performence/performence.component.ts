import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-performence',
  imports: [CommonModule],
  templateUrl: './performence.component.html',
  styleUrls: ['./performence.component.css']
})
export class PerformenceComponent implements OnInit {
  userId: number | null = null; // Store userId
  userProgress: any = null; // Store user progress data for students
  allPerformances: any[] = []; // Store all performances for admins
  isAdmin: boolean = false; // Flag to check if the user is an admin

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Check if the user is an admin
    this.isAdmin = this.hasRole('ADMIN');

    if (this.isAdmin) {
      // Fetch all performances for admin
      this.fetchAllPerformances();
    } else {
      // Fetch performance for the logged-in student
      this.userId = +localStorage.getItem('userId')!;
      console.log('Retrieved userId:', this.userId); // Debug log

      if (this.userId) {
        this.fetchUserPerformance(this.userId);
      } else {
        alert('User ID not found in local storage.');
      }
    }
  }

  // Fetch performance for a specific user
  fetchUserPerformance(userId: number): void {
    this.http.get(`http://localhost:9091/performence/getProgressByUserId/${userId}`, { headers: this.getAuthHeaders(), responseType: 'json' }).subscribe({
      next: (response: any) => {
        console.log('User progress data:', response); // Debug log
        this.userProgress = response; // Store response
      },
      error: (error: any) => {
        console.error('Error fetching user progress:', error);
        alert('Failed to load performance data. Please try again later.');
      }
    });
  }

  // Fetch all performances for admin
  fetchAllPerformances(): void {
    // Step 1: Fetch all user details
    this.http.get<any[]>(`http://localhost:9091/auth/getAll`, { headers: this.getAuthHeaders() }).subscribe({
      next: (users: any[]) => {
        const userIds = users.map(user => user.userId); // Extract user IDs
        console.log('Fetched user IDs:', userIds); // Debug log

        if (userIds.length === 0) {
          console.warn('No user IDs found.');
          alert('No users found to fetch performances.');
          return;
        }

        // Step 2: Fetch performance data for each user using forkJoin
        const performanceRequests = userIds.map(userId =>
          this.http.get(`http://localhost:9091/performence/getProgressByUserId/${userId}`, { headers: this.getAuthHeaders(), responseType: 'json' })
        );

        console.log('Performance requests:', performanceRequests); // Debug log

        forkJoin(performanceRequests).subscribe({
          next: (responses: any[]) => {
            // Combine user roles with performance data
            this.allPerformances = responses.map((performance, index) => ({
              ...performance,
              role: users[index].roles // Add the role from the user data
            }));
            console.log('All performances data with roles:', this.allPerformances); // Debug log
          },
          error: (error: any) => {
            console.error('Error fetching all performances:', error);
            alert('Failed to load all performances. Please try again later.');
          }
        });
      },
      error: (error: any) => {
        console.error('Error fetching user IDs:', error);
        alert('Failed to load user IDs. Please try again later.');
      }
    });
  }

  // Check if the user has a specific role
  private hasRole(role: string): boolean {
    const roles = localStorage.getItem('roles');
    return roles ? roles.split(',').includes(role) : false;
  }

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
}