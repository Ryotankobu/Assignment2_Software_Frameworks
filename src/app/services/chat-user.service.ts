import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatUserService {
  private apiUrl = 'http://localhost:3001/api';  // Backend API base URL

  constructor(private http: HttpClient) {}

  // <!-- Super Admin services-- --------------------------------------------------------- -->
  // Function to promote a user to Group Admin
  promoteToGroupAdmin(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/promotetogroupadmin`, { username });
  }

  // Function to remove a user
  removeUser(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/removeuser`, { username });
  }

  // Function to upgrade a user to Super Admin
  upgradeToSuperAdmin(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/upgradetosuperadmin`, { username });
  }


  // <!-- Group Admin services-- --------------------------------------------------------- -->
  createGroup(username: string, groupName: string): Observable<any> {
    // console.log(groupName)
    // console.log(username)
  return this.http.post(`${this.apiUrl}/creategroup`, { username, groupName });
}

removeGroup(username: string, groupName: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/removegroup`, { username, groupName });
}
}
