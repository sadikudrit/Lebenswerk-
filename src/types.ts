export type ServiceCategory = 
  | 'classical-physio'
  | 'manual-therapy'
  | 'pain-therapy'
  | 'neuro-rehab'
  | 'geriatric-care'
  | 'post-surgery'
  | 'spine-back'
  | 'sports-ortho'
  | 'post-surgical'
  | 'joint-mobility'
  | 'chronic-pain'
  | 'telehealth';

export type InquiryType = 'appointment' | 'question' | 'feedback';

export interface ContactInquiry {
  id: string;
  type: InquiryType;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  description: string;
  treatmentLocation?: 'practice' | 'home';
  preferredDate?: string;
  preferredTime?: string;
  serviceId?: string;
  serviceName?: string;
  status: 'new' | 'reviewed' | 'contacted';
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  recommendedFor: string[];
  icon: string;
  badge?: string;
  image: string;
}

export interface Physiotherapist {
  id: string;
  name: string;
  title: string;
  credentials: string[];
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  avatar: string;
  bio: string;
  specialties: string[];
  education: string;
  email?: string;
  availableDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  consultationFee: number;
  languages: string[];
  nextAvailable: string; // e.g. "Today at 2:30 PM"
}

export interface Appointment {
  id: string;
  confirmationCode: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  serviceId: string;
  serviceName: string;
  specialistId: string;
  specialistName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  durationMinutes?: number;
  treatmentLocation?: 'practice' | 'home';
  meetingType?: 'hospital-clinic' | 'home-visit' | 'telehealth-video';
  streetAddress?: string;
  zipCity?: string;
  addressNotes?: string;
  painArea?: string;
  painLevel?: number; // 1 to 10
  symptomsNotes?: string;
  medicalHistory?: string;
  insuranceProvider?: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  createdAt: string;
  googleCalendarSynced?: boolean;
  googleEventLink?: string;
  remindersEnabled?: {
    email24h: boolean;
    email2h: boolean;
    sms: boolean;
  };
  price: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  targetArea: string;
  sets: number;
  reps: string;
  holdSeconds?: number;
  frequency: string;
  instructions: string[];
  precautions: string;
  difficulty: 'Gentle' | 'Moderate' | 'Advanced';
  completedToday: boolean;
  streakDays: number;
}

export interface PatientHistoryRecord {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dob: string;
  primaryCondition: string;
  initialPainScore: number;
  currentPainScore: number;
  mobilityImprovementPct: number;
  carePlanStartDate: string;
  targetRecoveryDate: string;
  attendingPhysio: string;
  clinicalNotes: {
    date: string;
    physio: string;
    note: string;
    measurements: string;
  }[];
  prescribedExercises: ExerciseItem[];
  painTrajectory: {
    week: string;
    score: number;
    activityScore: number;
  }[];
}

export interface EmailReminderSimulation {
  id: string;
  appointmentId: string;
  recipientEmail: string;
  recipientName: string;
  type: 'booking-confirmed' | 'reminder-24h' | 'reminder-2h' | 'post-care-review';
  subject: string;
  scheduledTime: string;
  sentAt?: string;
  status: 'sent' | 'scheduled' | 'delivered';
  htmlContent: string;
  calendarIcsUrl?: string;
}

export interface BodyAreaPainPoint {
  id: string;
  name: string;
  commonInjuries: string[];
  symptoms: string[];
  recommendedServiceId: string;
  recommendedPhysioSpecialty: string;
  selfCareAdvice: string;
}
