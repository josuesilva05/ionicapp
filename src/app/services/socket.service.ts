import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private httpClient = inject(HttpClient);
  constructor() {}

  connect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.close();
    }

    this.socket = io(`ws://${environment.socket}`, {
      transports: ['websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      autoConnect: false,
      forceNew: true,
      secure: false,
      rejectUnauthorized: false
    });

    this.socket.connect();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
    }
  }

  getBusLine(lineId: string): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
    this.socket.emit('bus_lines', lineId);
  }

  getPolylines(lineId: string): Observable<any> {
    return this.httpClient.get(`http://${environment.socket}/api/map/polylines/${lineId}`);
  }

  onData(): Observable<{ type: string, data: any }> {
    return new Observable(observer => {
      if (!this.socket) return;

      const handler = (rawData: [string, any]) => {
        try {
          const [type, payload] = rawData;
          observer.next({
            type,
            data: type === 'sync' ? payload.data : payload
          });
        } catch (error) {
          observer.error(error);
        }
      };

      this.socket.on('data', handler);
      return () => this.socket.off('data', handler);
    });
  }
}
