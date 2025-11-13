export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'patient' | 'admin';
  createdAt: string;
};

export type Doctor = {
  id: string;
  name: string;
  imageId: string;
  specialties: string[];
  qualifications: string[];
  yearsExperience: number;
  ratings: {
    avg: number;
    count: number;
  };
  fees: number;
  clinics: Clinic[];
};

export type Clinic = {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  contactNumber: string;
  schedule: {
    dayOfWeek: number;
    start: string;
    end: string;
  }[];
  capacity: number;
};

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  slot: {
    start: string;
    end: string;
  };
  status: 'booked' | 'cancelled' | 'completed';
  createdAt: string;
};

export type EmergencyRoom = {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    bedsAvailable: number;
    etaDrivingMinutes: number;
    callNumber: string;
    ambulanceNumber: string;
    mapUrl: string;
    imageId: string;
}
