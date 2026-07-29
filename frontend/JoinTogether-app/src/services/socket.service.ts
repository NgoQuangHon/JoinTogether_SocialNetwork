import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });
    }
    return this.socket;
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  joinRoom(phongId: number | string) {
    this.getSocket().emit('join_room', phongId);
  }

  leaveRoom(phongId: number | string) {
    this.getSocket().emit('leave_room', phongId);
  }

  sendMessage(phongId: number, nguoiGuiId: number, noiDung: string, nguoiGuiTen?: string) {
    this.getSocket().emit('send_message', { phongId, nguoiGuiId, noiDung, nguoiGuiTen });
  }

  onReceiveMessage(callback: (msg: any) => void) {
    const socket = this.getSocket();
    socket.off('receive_message');
    socket.on('receive_message', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
