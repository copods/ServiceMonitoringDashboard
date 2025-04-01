import { AppDispatch } from '../../store';
import { updateService } from '../../store/slices/servicesSlice';
import { ServiceUpdate } from '../../types/service';

class SocketService {
  private socket: WebSocket | null = null;
  private dispatch: AppDispatch | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  
  initialize(dispatch: AppDispatch): () => void {
    this.dispatch = dispatch;
    
    // Connect to WebSocket server
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3002';
    this.connect(wsUrl);
    
    // Return cleanup function
    return () => {
      this.disconnect();
    };
  }
  
  private connect(wsUrl: string): void {
    try {
      this.socket = new WebSocket(wsUrl);
      
      // Set up event handlers
      this.socket.onopen = this.handleOpen;
      this.socket.onmessage = this.handleMessage;
      this.socket.onerror = this.handleError;
      this.socket.onclose = this.handleClose;
      
      // Reset reconnect attempts on successful connection attempt
      this.socket.addEventListener('open', () => {
        this.reconnectAttempts = 0;
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.attemptReconnect(wsUrl);
    }
  }
  
  private disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  private attemptReconnect(wsUrl: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect(wsUrl);
    }, delay);
  }
  
  private handleOpen = (): void => {
    console.log('WebSocket connection established');
  };
  
  private handleMessage = (event: MessageEvent): void => {
    try {
      // Parse message data
      const data = JSON.parse(event.data);
      
      // Handle different message types
      switch (data.type) {
        case 'SERVICE_UPDATE':
          if (this.dispatch) {
            this.dispatch(updateService(data.payload as ServiceUpdate));
          }
          break;
          
        case 'INITIAL_DATA':
          console.log('Received initial data from WebSocket');
          break;
          
        default:
          console.warn('Unknown message type:', data.type);
          break;
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };
  
  private handleError = (error: Event): void => {
    console.error('WebSocket error:', error);
  };
  
  private handleClose = (event: CloseEvent): void => {
    console.log('WebSocket connection closed:', event.code, event.reason);
    
    // Only attempt to reconnect if it wasn't a normal closure
    if (event.code !== 1000) {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3002';
      this.attemptReconnect(wsUrl);
    }
  };
  
  // Method to send messages to the server
  sendMessage(type: string, payload: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('Cannot send message, WebSocket is not connected');
    }
  }
  
  // Check if socket is connected
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
