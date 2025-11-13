import type { Doctor, Clinic, Appointment, EmergencyRoom } from './types';

export const clinics: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'Mumbai Central Medical Center',
    location: { lat: 19.0760, lng: 72.8777, address: '123 MG Road, Mumbai, Maharashtra' },
    contactNumber: '+91 22 2555 0101',
    schedule: [{ dayOfWeek: 1, start: '09:00', end: '17:00' }],
    capacity: 20
  },
  {
    id: 'clinic-2',
    name: 'Delhi Health Hub',
    location: { lat: 28.6139, lng: 77.2090, address: '456 Connaught Place, New Delhi, Delhi' },
    contactNumber: '+91 11 2555 0102',
    schedule: [{ dayOfWeek: 1, start: '08:00', end: '18:00' }],
    capacity: 30
  },
  {
    id: 'clinic-3',
    name: 'Bangalore Wellness Clinic',
    location: { lat: 12.9716, lng: 77.5946, address: '789 Koramangala, Bangalore, Karnataka' },
    contactNumber: '+91 80 2555 0103',
    schedule: [{ dayOfWeek: 2, start: '10:00', end: '19:00' }],
    capacity: 15
  },
  {
    id: 'clinic-4',
    name: 'Chennai General Practice',
    location: { lat: 13.0827, lng: 80.2707, address: '101 Anna Salai, Chennai, Tamil Nadu' },
    contactNumber: '+91 44 2555 0104',
    schedule: [{ dayOfWeek: 3, start: '09:00', end: '17:00' }],
    capacity: 25
  },
  {
    id: 'clinic-5',
    name: 'Hyderabad Specialists',
    location: { lat: 17.3850, lng: 78.4867, address: '321 Banjara Hills, Hyderabad, Telangana' },
    contactNumber: '+91 40 2555 0105',
    schedule: [{ dayOfWeek: 4, start: '09:00', end: '20:00' }],
    capacity: 40
  }
];

export const doctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Priya Sharma',
    imageId: 'doc-1',
    specialties: ['Cardiology'],
    qualifications: ['MD', 'FACC'],
    yearsExperience: 15,
    ratings: { avg: 4.9, count: 258 },
    fees: 1500,
    clinics: [clinics[0], clinics[4]],
  },
  {
    id: 'doc-2',
    name: 'Dr. Rohan Mehra',
    imageId: 'doc-2',
    specialties: ['Neurology'],
    qualifications: ['MD', 'DM (Neurology)'],
    yearsExperience: 12,
    ratings: { avg: 4.8, count: 192 },
    fees: 1200,
    clinics: [clinics[1]],
  },
  {
    id: 'doc-3',
    name: 'Dr. Anjali Desai',
    imageId: 'doc-3',
    specialties: ['Pediatrics'],
    qualifications: ['MD', 'DCH'],
    yearsExperience: 10,
    ratings: { avg: 4.9, count: 312 },
    fees: 800,
    clinics: [clinics[2]],
  },
  {
    id: 'doc-4',
    name: 'Dr. Vikram Singh',
    imageId: 'doc-4',
    specialties: ['Dermatology'],
    qualifications: ['MD', 'DDVL'],
    yearsExperience: 8,
    ratings: { avg: 4.7, count: 150 },
    fees: 1000,
    clinics: [clinics[0], clinics[3]],
  },
  {
    id: 'doc-5',
    name: 'Dr. Aisha Khan',
    imageId: 'doc-5',
    specialties: ['Endocrinology'],
    qualifications: ['MD', 'DM (Endocrinology)'],
    yearsExperience: 11,
    ratings: { avg: 4.8, count: 180 },
    fees: 1400,
    clinics: [clinics[4]],
  },
  {
    id: 'doc-6',
    name: 'Dr. Arjun Reddy',
    imageId: 'doc-6',
    specialties: ['Gastroenterology', 'Cardiology'],
    qualifications: ['MD', 'DM (Gastro)'],
    yearsExperience: 9,
    ratings: { avg: 4.6, count: 134 },
    fees: 1300,
    clinics: [clinics[1], clinics[2]],
  },
  {
    id: 'doc-7',
    name: 'Dr. Sneha Patil',
    imageId: 'doc-7',
    specialties: ['Oncology', 'Neurology'],
    qualifications: ['MD', 'FACP'],
    yearsExperience: 20,
    ratings: { avg: 4.9, count: 402 },
    fees: 2000,
    clinics: [clinics[0], clinics[1], clinics[4]],
  },
  {
    id: 'doc-8',
    name: 'Dr. Sameer Gupta',
    imageId: 'doc-8',
    specialties: ['Ophthalmology'],
    qualifications: ['MS (Ophthalmology)'],
    yearsExperience: 14,
    ratings: { avg: 4.8, count: 210 },
    fees: 900,
    clinics: [clinics[3]],
  },
  {
    id: 'doc-9',
    name: 'Dr. Kavita Joshi',
    imageId: 'doc-9',
    specialties: ['Rheumatology', 'Dermatology'],
    qualifications: ['MD'],
    yearsExperience: 7,
    ratings: { avg: 4.7, count: 98 },
    fees: 1100,
    clinics: [clinics[2], clinics[4]],
  },
  {
    id: 'doc-10',
    name: 'Dr. Mohan Kumar',
    imageId: 'doc-10',
    specialties: ['Urology', 'Orthopedics'],
    qualifications: ['MS', 'MCh (Urology)'],
    yearsExperience: 18,
    ratings: { avg: 4.9, count: 289 },
    fees: 1800,
    clinics: [clinics[0]],
  },
];

export const appointments: Appointment[] = [
    // Mock appointments can be added here
];

export const emergencyRooms: EmergencyRoom[] = [
    {
        id: 'er-1',
        name: 'Apollo Hospital Emergency Room',
        location: { lat: 19.0760, lng: 72.8777, address: 'Belapur, Navi Mumbai, Maharashtra'},
        bedsAvailable: 5,
        etaDrivingMinutes: 8,
        callNumber: '+91 22 3098 7654',
        ambulanceNumber: '102',
        mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=Apollo+Hospital,Navi+Mumbai',
        imageId: 'er-1'
    },
    {
        id: 'er-2',
        name: 'Fortis Escorts Heart Institute',
        location: { lat: 28.5526, lng: 77.2536, address: 'Okhla, New Delhi, Delhi'},
        bedsAvailable: 2,
        etaDrivingMinutes: 12,
        callNumber: '+91 11 4713 5000',
        ambulanceNumber: '102',
        mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=Fortis+Escorts+Heart+Institute,New+Delhi',
        imageId: 'er-2'
    },
    {
        id: 'er-3',
        name: 'Manipal Hospital ER',
        location: { lat: 12.9592, lng: 77.6433, address: 'Old Airport Road, Bangalore, Karnataka'},
        bedsAvailable: 8,
        etaDrivingMinutes: 15,
        callNumber: '+91 80 2502 4444',
        ambulanceNumber: '108',
        mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=Manipal+Hospital,Bangalore',
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
