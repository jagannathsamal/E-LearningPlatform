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
  
  

  logout() {
    this.isLoggedIn = false
    localStorage.removeItem('jwtToken'); 
    localStorage.removeItem('username'); 
    localStorage.removeItem('isLoggedIn'); 
    localStorage.removeItem('userId'); 
    localStorage.removeItem('roles'); 
    console.log("User logged out successfully.");
    this.router.navigate(['/login']).then(() => {
      location.reload();
    });
  }
  
}