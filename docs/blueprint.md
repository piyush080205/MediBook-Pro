# **App Name**: MediBook Pro

## Core Features:

- Smart Triage Engine: AI-powered triage tool that recommends the appropriate medical specialty, urgency level, and next steps based on user-reported symptoms, age, and gender.
- Doctor Search and Comparison: Allow users to find and filter doctors by specialty, location, rating and availability. Also allow to compare doctors across fees, ratings, experience, distance, and next available slots.
- Slot Optimization Engine: Optimizes appointment scheduling by suggesting the best available slots, minimizing fragmentation, and maximizing contiguous appointments, considering no-show probabilities. Acts as a validation tool before actually booking an appointment.
- Appointment Booking and Confirmation: Enables users to book appointments, validate slots, receive SMS confirmations and reminders via Twilio, and manage bookings.
- Queue Prediction: Provides real-time queue prediction with patients-ahead and estimated wait times for clinics, utilizing historical queue data and optional exponential smoothing. Acts as a confidence measurement tool.
- Emergency Routing: Routes users to the nearest emergency room, providing real-time ETA, bed availability, contact information, and navigation via an "Emergency Mode" button.
- User Authentication: Secure user registration and authentication using OTP verification sent via SMS. Firebase Phone Auth is an optional alternative. Manages user profiles and roles.

## Style Guidelines:

- Primary color: Deep blue (#293B5F) to convey trust and professionalism in a medical context.
- Background color: Very light blue (#E5E9F2), subtly desaturated to maintain focus on content.
- Accent color: Soft purple (#6D5B98) to add a touch of modernity and differentiate key interactions.
- Body font: 'PT Sans' (sans-serif) for readability and a modern, yet warm feel.
- Headline font: 'Literata' (serif) adds a touch of elegance and works well in contrast to the body font.
- Use a set of clean, geometric icons to represent different medical specialties and actions.
- Prioritize a desktop-first, responsive design with clear calls to action (CTAs) and accessible forms to ensure usability.