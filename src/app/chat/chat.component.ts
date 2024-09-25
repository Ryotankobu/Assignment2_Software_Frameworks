import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SocketService } from '../services/socket.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'] // Note the correct plural form here
})
export class ChatComponent {
  private socket: any;
  messageContent: string = '';
  messages: string[] = [];
  rooms: any[] = [];
  roomslist: string = '';
  roomnotice: string = '';
  currentroom: string = '';
  isinRoom = false;
  newroom: string = '';
  numusers: number = 0;
  canCreateGroup: boolean = false;
  user: any;

  constructor(private socketservice: SocketService, private router: Router) {}

  ngOnInit() {
    const currentUserData = sessionStorage.getItem('current_user');
    if (currentUserData) {
      this.user = JSON.parse(currentUserData);
      console.log('User found in session:', this.user);
    } else {
      console.error('No current user found in session storage');
      this.router.navigate(['/login']);
      return; // Early exit to prevent further execution
    }

    this.socketservice.initSocket();
    this.setupSocketListeners();
  }

setupSocketListeners() {
  this.socketservice.getMessage((m) => {
    this.messages.push(m);
  });

  this.socketservice.reqroomList();
 this.socketservice.getroomList((msg) => {
  console.log('All rooms received from server:', msg);
  console.log('User groups:', this.user.groups);

  // Check if filtering logic works properly
  this.rooms = JSON.parse(msg).filter((room: string) => {
    console.log('Checking room:', room);
    return this.user.groups.includes(room);
  });

  console.log('Filtered rooms for the user:', this.rooms);
});


  this.socketservice.notice((msg) => {
    this.roomnotice = msg;
  });

  this.socketservice.joined((msg) => {
    this.currentroom = msg;
    this.isinRoom = this.currentroom !== '';
  });
}



  // Join a selected room
  joinroom() {
    if (!this.roomslist) {
      console.error('No room selected.');
      this.roomnotice = 'Please select a room to join.';
      return;
    }

    if (this.user.groups.includes(this.roomslist)) {
      this.socketservice.joinroom(this.roomslist);
      this.socketservice.reqnumbers(this.roomslist);
      this.socketservice.getnumusers((res) => {
        this.numusers = res;
        console.log('Number of users in the room:', this.numusers);
      });
      this.roomnotice = ''; // Clear any previous notices if the room is joined successfully
    } else {
      console.error('You do not have access to this room.');
      this.roomnotice = 'Access Denied: You do not have access to this room.';
    }
  }

  // Clear the room notice
  clearnotice() {
    this.roomnotice = '';
  }

  // Leave the current room
  leaveroom() {
    this.socketservice.leaveroom(this.currentroom);
    this.socketservice.reqnumbers(this.currentroom);
    this.socketservice.getnumusers((res) => {
      this.numusers = res;
      console.log('Updated number of users after leaving the room:', this.numusers);
    });
    this.currentroom = '';
    this.isinRoom = false;
    this.numusers = 0;
    this.roomnotice = '';
    this.messages = [];
  }

  // Send a chat message
  chat() {
    if (this.messageContent) {
      this.socketservice.sendMessage(this.messageContent);
      this.messageContent = '';
    } else {
      console.log('No message to send');
    }
  }


  selectRoom(room: string) {
  this.roomslist = room;
  console.log('Selected room:', this.roomslist);  // Log the selected room
}


  // Navigate back to the login page
  backLogin() {
    this.router.navigate(['/login']);
  }
}
