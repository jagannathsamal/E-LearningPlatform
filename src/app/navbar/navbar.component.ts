import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterOutlet, RouterLink,CommonModule,FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isLoggedIn = false
  searchQuery: string = ''; // Variable to hold the search query
  searchResults: any[] = [];
  constructor(private router:Router,private http: HttpClient) {
    const token = localStorage.getItem('jwtToken');
    this.isLoggedIn = !!token; // Check if token exists to set login state
    
  }
  ngOnInit() {
    // Check if token exists when the component loads
    this.isLoggedIn = !!localStorage.getItem('jwtToken');
  }

  hasRole(role: string): boolean {
    const roles = localStorage.getItem('roles');
    return roles ? roles.split(',').includes(role) : false;
  }
  
  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Fetch search results from the backend
      this.http.get(`http://localhost:9091/search?q=${this.searchQuery}`).subscribe({
        next: (results: any) => {
          this.searchResults = results;
          console.log('Search Results:', this.searchResults); // Debug log
        },
        error: (error) => {
          console.error('Error fetching search results:', error);
        }
      });
    }
  }

  logout() {
    this.isLoggedIn = false
    localStorage.removeItem('jwtToken'); // Removes the stored token
    localStorage.removeItem('username'); // Removes the stored username
    localStorage.removeItem('isLoggedIn'); // Removes the login state
    localStorage.removeItem('userId'); // Removes the user ID if stored
    localStorage.removeItem('roles'); // Removes the user role if stored
    console.log("User logged out successfully.");
    this.router.navigate(['/login']).then(() => {
      location.reload(); // Ensures header updates immediately
    });
  }
  
}