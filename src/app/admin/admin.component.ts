import { Component } from '@angular/core';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { ChatUserService } from '../services/chat-user.service';  // Import your service
import { HeaderComponent } from '../header/header.component';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule for HTTP requests

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, HeaderComponent, HttpClientModule],  // Ensure HttpClientModule is imported here
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  userInfo: any = null;
  isSuperAdmin: boolean = false;
  isGroupAdmin: boolean = false;
  isChatUser: boolean = false;

  constructor(private chatUserService: ChatUserService) {  // Inject the service

 const storedUserInfo = sessionStorage.getItem('current_user');
try {
  if (storedUserInfo) {
    // Check if storedUserInfo is a string and try to parse it
    this.userInfo = typeof storedUserInfo === 'string' ? JSON.parse(storedUserInfo) : storedUserInfo;
    this.isSuperAdmin = this.userInfo.role === 'SuperAdmin';
    this.isGroupAdmin = this.userInfo.role === 'GroupAdmin';
    this.isChatUser = this.userInfo.role === 'ChatUser';
  }
} catch (error) {
  console.error("Error parsing stored user info:", error);
  this.userInfo = null; // Reset user info on error
}
  }

  // <!-- Super Admin functions-- --------------------------------------------------------- -->
  // Function to promote a user to Group Admin
  promoteToGroupAdmin(username: string) {
    if (username) {
      this.chatUserService.promoteToGroupAdmin(username).subscribe(
        response => {
          console.log('User promoted to Group Admin:', response);
        },
        error => {
          console.error('Error promoting user:', error);
        }
      );
    }
  }

  // Function to remove a user
  removeUser(username: string) {
    if (username) {
      this.chatUserService.removeUser(username).subscribe(
        response => {
          console.log('User removed:', response);
        },
        error => {
          console.error('Error removing user:', error);
        }
      );
    }
  }

  // Function to upgrade a user to Super Admin
  upgradeToSuperAdmin(username: string) {
    if (username) {
      this.chatUserService.upgradeToSuperAdmin(username).subscribe(
        response => {
          console.log('User upgraded to Super Admin:', response);
        },
        error => {
          console.error('Error upgrading user:', error);
        }
      );
    }
  }

    // <!-- Group Admin functions-- --------------------------------------------------------- -->
// Function to create a group
createGroup(groupName: string) {
  if (groupName) {
    const username = this.userInfo.username;  // Retrieve username from userInfo
    
    // console.log("Username:", this.userInfo.username);
    // console.log("Role:", this.userInfo.role);
    // console.log("Group Name:", groupName);


    if (this.userInfo.role === "GroupAdmin") {
      this.chatUserService.createGroup(username, groupName).subscribe(
        response => {
          console.log('Group created:', response);
          this.userInfo.groups = response.groups;
          alert('Group created successfully');
        },
        error => {
          console.error('Error creating group:', error);
        }
      );
    } else {
      console.error("You do not have permission to create a group.");
    }
  }
}

// Function to remove a group
removeGroup(groupName: string) {
  if (groupName) {
    const username = this.userInfo.username;  // Retrieve the username of the GroupAdmin

    if (this.userInfo.role === "GroupAdmin") {
      this.chatUserService.removeGroup(username, groupName).subscribe(
        response => {
          console.log('Group removed:', response);

          // Update the local userInfo.groups array with the updated list of groups from the server
          this.userInfo.groups = response.groups;

          // Optional: Display a success message
          alert('Group removed successfully');
        },
        error => {
          console.error('Error removing group:', error);
        }
      );
    } else {
      console.error("You do not have permission to remove a group.");
    }
  }
}



}
