# MediBook Pro

MediBook Pro is an intelligent, AI-powered healthcare platform designed to streamline the process of finding and booking medical appointments. It offers a suite of advanced features to enhance the patient experience, from initial symptom assessment to post-appointment management.

## ✨ Key Features

- **Smart Triage Engine**: An AI-powered tool that analyzes user-reported symptoms to recommend the appropriate medical specialty and urgency level.
- **Doctor Search & Comparison**: A comprehensive directory of doctors that users can filter by specialty, location, and ratings. A comparison tool helps users make informed decisions.
- **AI Slot Optimizer**: Finds and suggests the most efficient appointment times to reduce waiting periods and minimize clinic downtime.
- **Appointment Booking**: A seamless booking process with SMS confirmations (powered by Twilio).
- **AI Queue Prediction**: Provides real-time estimates for clinic wait times, helping patients plan their visits more effectively.
- **Emergency Mode**: A one-tap feature that identifies nearby emergency rooms, provides ETAs, and can send an SMS alert with the user's live location to an emergency contact.
- **AI Medical Document Interpreter**: Allows users to upload images of prescriptions or lab reports and uses AI to extract and visualize key information.
- **Voice-Powered Accessibility**: Enables hands-free interaction for triage and appointment booking, making the app accessible to a wider audience.
- **User Authentication & Profiles**: Secure sign-in using Google, phone (OTP), or anonymous guest access. Users can manage their profiles and save emergency contacts.

## 🛠️ Technology Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router) with [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) components
- **Generative AI**: [Google's Gemini models](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **SMS Notifications**: [Twilio](https://www.twilio.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or a compatible package manager
- A Firebase project with Firestore and Authentication enabled.
- A Twilio account for SMS functionality.

### 1. Clone the Repository

```bash
git clone https://github.com/piyush080205/MediBook-Pro.git
cd MediBook Pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root of the project and add the necessary environment variables. The application requires API keys for Firebase and Twilio.

```env
# Firebase - Provided by your Firebase project's web app settings
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."

# Twilio - From your Twilio dashboard
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="..."

# Genkit - From Google AI Studio
GEMINI_API_KEY="..."

# MapTiler for Emergency Map View
NEXT_PUBLIC_MAPTILER_API_KEY="..."
```

### 4. Run the Development Servers

This project requires two concurrent development servers: one for the Next.js frontend and another for the Genkit AI flows.

**In your first terminal, run the Next.js app:**
```bash
npm run dev
```
This will start the web application, typically on `http://localhost:9002`.

**In your second terminal, run the Genkit AI server:**
```bash
npm run genkit:watch
```
This starts the local Genkit server, which the Next.js app will call for AI-powered features. It will watch for changes and automatically restart.

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Runs the linter to check for code quality issues.
- `npm run genkit:dev`: Starts the Genkit development server.
- `npm run genkit:watch`: Starts the Genkit server in watch mode.
