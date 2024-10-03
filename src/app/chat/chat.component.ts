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
  styleUrls: ['./chat.component.css']
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
  numusers: number = 0;
  user: any;

  constructor(private socketservice: SocketService, private router: Router) {}

  ngOnInit() {
    const currentUserData = sessionStorage.getItem('current_user');
    if (currentUserData) {
      this.user = JSON.parse(currentUserData);
    } else {
      this.router.navigate(['/login']);
      return;
    }

    this.socketservice.initSocket();
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    // Listen for messages from the server
    this.socketservice.getMessage((m) => {
      this.messages.push(m);
    });

    // Request the room list from the server
    this.socketservice.reqroomList();
    this.socketservice.getroomList((msg) => {
      console.log('All rooms received from server:', msg);
      this.rooms = JSON.parse(msg).filter((room: string) => {
        return this.user.groups.includes(room);
      });
    });

    // Listen for notices about users joining/leaving
    this.socketservice.notice((msg) => {
      this.roomnotice = msg;
    });

    // Listener for the 'joined' event
    this.socketservice.joined((room) => {
      console.log('Joined room event received:', room); 
      this.currentroom = room;
      this.isinRoom = true;
      console.log('isinRoom set to:', this.isinRoom);  // Ensure isinRoom is being updated
    });
  }

  joinroom() {
    if (!this.roomslist) {
      this.roomnotice = 'Please select a room to join.';
      return;
    }

    if (this.user.groups.includes(this.roomslist)) {
      this.socketservice.joinroom(this.roomslist);
      this.roomnotice = '';  // Clear any previous room notices
    } else {
      this.roomnotice = 'Access Denied: You do not have access to this room.';
    }
  }

  leaveroom() {
    this.socketservice.leaveroom(this.currentroom);
    this.isinRoom = false;
    this.currentroom = '';
    this.numusers = 0;
    this.roomnotice = '';
    this.messages = [];
  }

  chat() {
    if (this.messageContent.trim()) {
      // Send message along with the current room
      this.socketservice.sendMessage({
        message: this.messageContent,
        room: this.currentroom
      });
      this.messages.push(`You: ${this.messageContent}`);
      this.messageContent = '';
    }
  }

  clearnotice() {
    this.roomnotice = '';
  }

  selectRoom(room: string) {
    this.roomslist = room;
  }

  backLogin() {
    this.router.navigate(['/login']);
  }
}
