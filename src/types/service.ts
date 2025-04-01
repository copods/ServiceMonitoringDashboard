export interface Service {
  id: string;
  name: string;
  domainId: string;
  status: 'normal' | 'warning' | 'critical';
  criticalityPercentage: number;
  totalRequests: number;
  failedRequests: number;
  alerts: number;
  criticalAlerts: number;
  importance: number; // Value from 0-100 to determine position in polar chart
  hourlyData: HourlyData[];
}

export interface HourlyData {
  hour: number; // 0-23
  totalRequests: number;
  failedRequests: number;
  timestamp: string;
}

export interface ServiceUpdate {
  id: string;
  status?: 'normal' | 'warning' | 'critical';
  criticalityPercentage?: number;
  totalRequests?: number;
  failedRequests?: number;
  alerts?: number;
  criticalAlerts?: number;
  importance?: number;
  hourlyData?: HourlyData[];
}
