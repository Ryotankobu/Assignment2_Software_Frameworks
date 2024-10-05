import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const SERVER_URL = 'http://localhost:3001/chat';
const BACKEND_URL = 'http://localhost:3001';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor(private http: HttpClient) {}

  initSocket(): void {
    console.log('Initializing socket connection to:', SERVER_URL);
    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],  // This ensures fallback mechanisms
      withCredentials: true  // Ensure credentials like cookies are sent properly
    });
    this.socket.on('connect', () => {
      console.log('Connected to server with socket ID:', this.socket.id);
    });
    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });
  }

  // Join a room
  joinroom(selroom: string): void {
    console.log('Joining room:', selroom);
    this.socket.emit("joinRoom", selroom);
  }

  // Leave a room
  leaveroom(selroom: string): void {
    this.socket.emit("leaveRoom", selroom);
  }

  // Listen for the 'joined' event from the server
  joined(next: (res: any) => void): void {
    this.socket.on('joined', (res: any) => next(res));
  }

  // Create a new room
  createroom(newroom: string): void {
    console.log('Creating room:', newroom);
    this.socket.emit('newroom', newroom);
  }

  // Request and get the number of users in a room
  reqnumbers(selroom: string): void {
    this.socket.emit("numbers", selroom);
  }

  getnumusers(next: (res: any) => void): void {
    this.socket.on('numbers', (res: any) => next(res));
  }

  // Request the room list from the server
  reqroomList(): void {
    console.log('Requesting room list');
    this.socket.emit('roomlist', 'list please');
  }

  getroomList(next: (res: any) => void): void {
    this.socket.on('roomlist', (res: any) => {
      console.log('Received room list:', res);
      next(res);
    });
  }

  // Listen for notices (e.g., a user joined or left)
  notice(next: (res: any) => void): void {
    this.socket.on('notice', (res: any) => next(res));
  }

  // Send a message to the server
  sendMessage(data: { message: string, room: string, sender: string }): void {
    console.log('Sending message:', data);
    this.socket.emit('message', data);  // Emit the message with the sender and room to the server
  }

  // Listen for incoming messages
 getMessage(next: (message: any) => void): void {
   this.socket.on('message', (message: any) => {
     console.log('Received message:', message);
     next(message);  // Ensure it passes both sender and message
   });
 }


  // New method to receive chat history
  getChatHistory(next: (history: any[]) => void): void {
    this.socket.on('chatHistory', (history: any[]) => {
      console.log('Received chat history:', history);
      next(history);  // Send the chat history to the client
    });
  }

  // Assign room (if needed)
  assignRoom(requestBody: any) {
    return this.http.post(`${BACKEND_URL}/api/assignroom`, requestBody, httpOptions);
  }
}
