export interface LogEntry {
    timestamp: Date;
    level: 'info' | 'error' | 'debug';
    message: string;
    context?: Record<string, any>;
}

export interface DashboardData {
    id: string;
    title: string;
    data: any; // Replace 'any' with a more specific type as needed
}

export interface UserPermissions {
    userId: string;
    canViewDashboard: boolean;
    canEditDashboard: boolean;
    canAccessLogs: boolean;
}