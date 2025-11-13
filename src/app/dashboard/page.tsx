import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

// Mock data for demonstration
const upcomingAppointments = [
  {
    id: 'appt-1',
    doctor: { name: 'Dr. Priya Sharma', specialty: 'Cardiology', imageId: 'doc-1' },
    clinic: { name: 'Mumbai Central Medical Center', address: '123 MG Road, Mumbai, Maharashtra' },
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: '10:30 AM',
  },
];

const pastAppointments = [
    {
    id: 'appt-2',
    doctor: { name: 'Dr. Vikram Singh', specialty: 'Dermatology', imageId: 'doc-4' },
    clinic: { name: 'Chennai General Practice', address: '101 Anna Salai, Chennai, Tamil Nadu' },
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    time: '02:00 PM',
    status: 'completed',
  },
  {
    id: 'appt-3',
    doctor: { name: 'Dr. Anjali Desai', specialty: 'Pediatrics', imageId: 'doc-3' },
    clinic: { name: 'Bangalore Wellness Clinic', address: '789 Koramangala, Bangalore, Karnataka' },
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    time: '11:00 AM',
    status: 'completed',
  }
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">My Appointments</h1>
        <p className="text-muted-foreground mt-2 md:text-lg">Manage your upcoming and past appointments.</p>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold font-headline mb-6">Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-6">
              {upcomingAppointments.map((appt) => (
                <Card key={appt.id} className="shadow-md">
                  <CardContent className="p-6 grid md:grid-cols-3 gap-6 items-center">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        {/* In a real app, you'd fetch the image URL */}
                        <AvatarFallback className="text-xl">{getInitials(appt.doctor.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{appt.doctor.name}</h3>
                        <p className="text-muted-foreground">{appt.doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{appt.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{appt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{appt.clinic.name}</span>
                      </div>
                    </div>
                     <div className="flex md:justify-end gap-2">
                        <Badge variant="default">Upcoming</Badge>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">You have no upcoming appointments.</p>
          )}
        </section>

        <section>
           <h2 className="text-2xl font-bold font-headline mb-6">Past Appointments</h2>
             {pastAppointments.length > 0 ? (
            <div className="space-y-6">
              {pastAppointments.map((appt) => (
                <Card key={appt.id} className="opacity-70">
                  <CardContent className="p-6 grid md:grid-cols-3 gap-6 items-center">
                    <div className="flex items-center gap-4">
                       <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-xl">{getInitials(appt.doctor.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{appt.doctor.name}</h3>
                        <p className="text-muted-foreground">{appt.doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                       <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{appt.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                       <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{appt.time}</span>
                      </div>
                    </div>
                     <div className="flex md:justify-end">
                       <Badge variant="secondary" className="capitalize">{appt.status}</Badge>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">You have no past appointments.</p>
          )}
        </section>
      </div>
    </div>
  );
}
