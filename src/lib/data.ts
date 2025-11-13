import type { Doctor, Clinic, Appointment, EmergencyRoom } from './types';

export const clinics: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'Downtown Medical Center',
    location: { lat: 40.7128, lng: -74.0060, address: '123 Main St, New York, NY' },
    contactNumber: '212-555-0101',
    schedule: [{ dayOfWeek: 1, start: '09:00', end: '17:00' }],
    capacity: 20
  },
  {
    id: 'clinic-2',
    name: 'Uptown Health Hub',
    location: { lat: 40.7580, lng: -73.9855, address: '456 Park Ave, New York, NY' },
    contactNumber: '212-555-0102',
    schedule: [{ dayOfWeek: 1, start: '08:00', end: '18:00' }],
    capacity: 30
  },
  {
    id: 'clinic-3',
    name: 'Brooklyn Wellness Clinic',
    location: { lat: 40.6782, lng: -73.9442, address: '789 Flatbush Ave, Brooklyn, NY' },
    contactNumber: '718-555-0103',
    schedule: [{ dayOfWeek: 2, start: '10:00', end: '19:00' }],
    capacity: 15
  },
  {
    id: 'clinic-4',
    name: 'Queens General Practice',
    location: { lat: 40.7282, lng: -73.7949, address: '101 Queens Blvd, Queens, NY' },
    contactNumber: '718-555-0104',
    schedule: [{ dayOfWeek: 3, start: '09:00', end: '17:00' }],
    capacity: 25
  },
  {
    id: 'clinic-5',
    name: 'Midtown Specialists',
    location: { lat: 40.7549, lng: -73.9840, address: '321 5th Ave, New York, NY' },
    contactNumber: '212-555-0105',
    schedule: [{ dayOfWeek: 4, start: '09:00', end: '20:00' }],
    capacity: 40
  }
];

export const doctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Evelyn Reed',
    imageId: 'doc-1',
    specialties: ['Cardiology'],
    qualifications: ['MD', 'FACC'],
    yearsExperience: 15,
    ratings: { avg: 4.9, count: 258 },
    fees: 300,
    clinics: [clinics[0], clinics[4]],
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Thorne',
    imageId: 'doc-2',
    specialties: ['Neurology'],
    qualifications: ['MD', 'PhD'],
    yearsExperience: 12,
    ratings: { avg: 4.8, count: 192 },
    fees: 275,
    clinics: [clinics[1]],
  },
  {
    id: 'doc-3',
    name: 'Dr. Elena Cruz',
    imageId: 'doc-3',
    specialties: ['Pediatrics'],
    qualifications: ['MD', 'FAAP'],
    yearsExperience: 10,
    ratings: { avg: 4.9, count: 312 },
    fees: 150,
    clinics: [clinics[2]],
  },
  {
    id: 'doc-4',
    name: 'Dr. Julian Bennett',
    imageId: 'doc-4',
    specialties: ['Dermatology'],
    qualifications: ['MD'],
    yearsExperience: 8,
    ratings: { avg: 4.7, count: 150 },
    fees: 200,
    clinics: [clinics[0], clinics[3]],
  },
  {
    id: 'doc-5',
    name: 'Dr. Anya Sharma',
    imageId: 'doc-5',
    specialties: ['Endocrinology'],
    qualifications: ['MD', 'FACE'],
    yearsExperience: 11,
    ratings: { avg: 4.8, count: 180 },
    fees: 250,
    clinics: [clinics[4]],
  },
  {
    id: 'doc-6',
    name: 'Dr. Ben Carter',
    imageId: 'doc-6',
    specialties: ['Gastroenterology', 'Cardiology'],
    qualifications: ['MD'],
    yearsExperience: 9,
    ratings: { avg: 4.6, count: 134 },
    fees: 220,
    clinics: [clinics[1], clinics[2]],
  },
  {
    id: 'doc-7',
    name: 'Dr. Olivia Hayes',
    imageId: 'doc-7',
    specialties: ['Oncology', 'Neurology'],
    qualifications: ['MD', 'FACP'],
    yearsExperience: 20,
    ratings: { avg: 4.9, count: 402 },
    fees: 350,
    clinics: [clinics[0], clinics[1], clinics[4]],
  },
  {
    id: 'doc-8',
    name: 'Dr. Samuel Chen',
    imageId: 'doc-8',
    specialties: ['Ophthalmology'],
    qualifications: ['MD'],
    yearsExperience: 14,
    ratings: { avg: 4.8, count: 210 },
    fees: 180,
    clinics: [clinics[3]],
  },
  {
    id: 'doc-9',
    name: 'Dr. Chloe Webb',
    imageId: 'doc-9',
    specialties: ['Rheumatology', 'Dermatology'],
    qualifications: ['MD'],
    yearsExperience: 7,
    ratings: { avg: 4.7, count: 98 },
    fees: 210,
    clinics: [clinics[2], clinics[4]],
  },
  {
    id: 'doc-10',
    name: 'Dr. Leo Maxwell',
    imageId: 'doc-10',
    specialties: ['Urology', 'Orthopedics'],
    qualifications: ['MD', 'FACS'],
    yearsExperience: 18,
    ratings: { avg: 4.9, count: 289 },
    fees: 290,
    clinics: [clinics[0]],
  },
];

export const appointments: Appointment[] = [
    // Mock appointments can be added here
];

export const emergencyRooms: EmergencyRoom[] = [
    {
        id: 'er-1',
        name: 'City General Hospital Emergency Room',
        location: { lat: 40.7145, lng: -74.0080, address: '200 Broadway, New York, NY'},
        bedsAvailable: 5,
        etaDrivingMinutes: 8,
        callNumber: '212-555-0110',
        mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=200+Broadway,New+York,NY',
        imageId: 'er-1'
    },
    {
        id: 'er-2',
        name: 'MetroHealth Emergency Center',
        location: { lat: 40.7620, lng: -73.9890, address: '550 W 42nd St, New York, NY'},
        bedsAvailable: 2,
        etaDrivingMinutes: 12,
        callNumber: '212-555-0112',
        mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=550+W+42nd+St,New+York,NY',
        imageId: 'er-2'
    },
    {
        id: 'er-3',
        name: 'Brooklyn Central ER',
        location: { lat: 40.6750, lng: -73.9500, address: '900 Atlantic Ave, Brooklyn, NY'},
        bedsAvailable: 8,
        etaDrivingMinutes: 15,
        callNumber: '718-555-0115',
        mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=900+Atlantic+Ave,Brooklyn,NY',
        imageId: 'er-3'
    }
];

// Server-side data fetching functions
export async function getDoctors(): Promise<Doctor[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return doctors;
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return doctors.find(doc => doc.id === id);
}

export async function getClinics(): Promise<Clinic[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return clinics;
}

export async function getClinicById(id: string): Promise<Clinic | undefined> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return clinics.find(clinic => clinic.id === id);
}
