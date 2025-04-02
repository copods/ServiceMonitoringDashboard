import { AppDispatch } from 'store';
import { updateService } from 'store/slices/servicesSlice';
import { ServiceUpdate } from 'types/service';

class SocketService {
  private socket: WebSocket | null = null;
  private dispatch: AppDispatch | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false; // Flag to prevent race conditions during initial connect

  initialize(dispatch: AppDispatch): () => void {
    this.dispatch = dispatch; // Always update dispatch if provided

    // If a socket exists or we are already attempting to connect, do nothing more
    if (this.socket !== null || this.isConnecting) {
      console.log('SocketService: Initialization called but already connected or connecting.');
      // Return a no-op cleanup for this specific effect run, 
      // as it didn't initiate the connection.
      return () => {}; 
    }

    console.log('SocketService: Initializing new connection.');
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3002';
    this.isConnecting = true; // Set flag before async operation
    this.connect(wsUrl);
    
    // Return the actual cleanup function for the effect run that initiated the connection
    return () => {
      console.log('SocketService: Cleanup function called.');
      this.disconnect();
    };
  }
  
  private connect(wsUrl: string): void {
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = this.handleOpen;
      this.socket.onmessage = this.handleMessage;
      this.socket.onerror = this.handleError;
      this.socket.onclose = this.handleClose;
      
      this.socket.addEventListener('open', () => {
        this.reconnectAttempts = 0;
        this.isConnecting = false; // Connection successful
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isConnecting = false; // Connection failed
      this.attemptReconnect(wsUrl);
    }
  }
  
  private disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      console.log('SocketService: Disconnecting WebSocket.');
      // Remove listeners to prevent errors during close
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null; // Set to null *after* closing
    }
    this.isConnecting = false; // Reset connection attempt flag
  }
  
  private attemptReconnect(wsUrl: string): void {
    // Don't attempt reconnect if already connecting or connected
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return;
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${this.reconnectAttempts})`);
    this.isConnecting = true; // Set flag before timeout
    this.reconnectTimeout = setTimeout(() => {
      console.log(`SocketService: Executing reconnect attempt ${this.reconnectAttempts}...`);
      this.connect(wsUrl);
    }, delay);
  }
  
  private handleOpen = (): void => {
    console.log('SocketService: WebSocket connection established');
    this.isConnecting = false; // Update flag on successful open
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
    console.log(`SocketService: WebSocket connection closed - Code: ${event.code}, Reason: ${event.reason || 'No reason given'}`);
    this.isConnecting = false; // Update flag on close
    this.socket = null; // Ensure socket is null on close
    
    // Attempt to reconnect only on abnormal closure and if not explicitly disconnected
    if (event.code !== 1000 && event.code !== 1005) { // 1000 = Normal, 1005 = No Status Rcvd (often client-side disconnect)
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3002';
      this.attemptReconnect(wsUrl);
    }
  };
  
  sendMessage(type: string, payload: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('Cannot send message, WebSocket is not connected');
    }
  }
  
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

const socketService = new SocketService();

export default socketService;
