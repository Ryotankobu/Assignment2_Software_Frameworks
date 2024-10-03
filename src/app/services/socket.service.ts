import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) { }

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


  joinroom(selroom: string): void {
    console.log('Joining room:', selroom);
    this.socket.emit("joinRoom", selroom);
  }

  leaveroom(selroom: string): void {
    this.socket.emit("leaveRoom", selroom);
  }

  joined(next: (res: any) => void): void {
    this.socket.on('joined', (res: any) => next(res));
  }

  createroom(newroom: string): void {
    console.log('Creating room:', newroom);
    this.socket.emit('newroom', newroom);
  }

  deleteGroup(data: any) {
    return this.http.post(`${BACKEND_URL}/api/deletegroup`, data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }


  reqnumbers(selroom: string): void {
    this.socket.emit("numbers", selroom);
  }

  getnumusers(next: (res: any) => void): void {
    this.socket.on('numbers', (res: any) => next(res));
  }

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

  notice(next: (res: any) => void): void {
    this.socket.on('notice', (res: any) => next(res));
  }

 sendMessage(data: { message: string, room: string }): void {
  this.socket.emit('message', data);  // Emit the message and room to the server
}


  getMessage(next: (message: any) => void): void {
    this.socket.on('message', (message: any) => next(message));
  }

assignRoom(requestBody: any) {
  return this.http.post(`${BACKEND_URL}/api/assignroom`, requestBody, httpOptions);
}

}
