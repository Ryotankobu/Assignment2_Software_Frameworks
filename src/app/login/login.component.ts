import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
const BACKEND_URL = 'http://localhost:3001';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private httpClient: HttpClient) {}

  onSubmit() {
    let user = { username: this.username, password: this.password };
    this.httpClient
      .post(BACKEND_URL + '/api/auth', user, httpOptions)
      .subscribe(
        (data: any) => {
          if (data.valid) {
            sessionStorage.setItem('current_user', JSON.stringify(data.userInfo));
            this.router.navigate(['/chat']);
          } else {
            // Display an invalid login message when credentials are wrong
            this.errorMessage = 'Invalid username or password. Please try again.';
          }
        },
        (error) => {
          // Handle server errors or connection issues
          console.error('Login error:', error);

          // Check for network or server issues (e.g., if the server is down or unreachable)
          if (error.status === 0) {
            this.errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          } else if (error.status === 401) {
            // Unauthorized - invalid credentials
            this.errorMessage = 'Invalid username or password. Please try again.';
          } else {
            // Handle other types of errors (e.g., 500 Internal Server Error)
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
          }
        }
      );
  }
}  // This is the closing brace for the class
