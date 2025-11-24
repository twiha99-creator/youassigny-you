export type UserRole = 'ADMIN' | 'REFEREE';
export type GameType = 'OUTDOOR' | 'FUTSAL';
export type AssignmentStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type AvailabilityType = 'AVAILABLE' | 'UNAVAILABLE';
export type PaymentStatus = 'PAID' | 'UNPAID';

export interface Group {
  id: string;
  name: string;
}

export interface BankDetails {
  accountHolder: string;
  bankName: string;
  routingNumber: string;
  accountNumberMasked: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  bankDetails?: BankDetails;
  groupId?: string; // The group this user belongs to
  isSuperAdmin?: boolean; // Developer/Super User access
}

export interface RefereePosition {
  role: string; // e.g., "Center Referee", "AR1", "Timekeeper"
  userId: string | null; // null if unassigned
  fee: number;
  status: AssignmentStatus;
  paymentStatus: PaymentStatus;
  paidAt?: string; // ISO Date string
}

export interface Game {
  id: string;
  groupId: string; // Games belong to a specific group/league
  type: GameType;
  homeTeam: string;
  awayTeam: string;
  field: string;
  locationCity: string;
  date: string;
  time: string;
  assignments: RefereePosition[];
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'EMAIL' | 'SMS';
  timestamp: number;
  read: boolean;
}

export interface Availability {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  type: AvailabilityType;
  notes?: string;
}

// For Gemini Grounding
export interface FieldLocationData {
  name: string;
  address: string;
  rating?: number;
  googleMapsUri?: string;
}