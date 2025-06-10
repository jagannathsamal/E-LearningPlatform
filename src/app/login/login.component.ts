import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'login',
  imports: [CommonModule,FormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  loginFailed: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  validate(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.loginFailed = false;
      this.errorMessage = '';

      const loginData = {
        username: this.username,
        password: this.password
      };

      this.authService.loginUser(loginData).subscribe({
        next: (response: string) => {
          console.log('Login successful:', response);
          this.isLoading = false;

          this.authService.storeUserData(response);

          this.router.navigate(['/']).then(() => {
            location.reload();
          });
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          this.loginFailed = true;

          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password!';
          } else if (error.status === 403) {
            this.errorMessage = 'Access denied. Please check your credentials.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else if (error.status === 0) {
            this.errorMessage = 'Network error. Please check if the server is running.';
          } else {
            this.errorMessage = 'Invalid Username or Password!';
          }
        }
      });
    } else {
      this.loginFailed = true;
      this.errorMessage = 'Please fill in all required fields.';
    }
  }
}