'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import type { Appointment } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Redirect non-logged-in users
  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to view the dashboard.",
        variant: "destructive"
      });
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const appointmentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/appointments`), orderBy('slot.start', 'desc'));
  }, [firestore, user]);

  const { data: appointments, isLoading: areAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const now = new Date();
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    appointments?.forEach(appt => {
      if (new Date(appt.slot.start) > now) {
        upcoming.push(appt);
      } else {
        past.push(appt);
      }
    });

    // Sort upcoming appointments ascending
    upcoming.sort((a, b) => new Date(a.slot.start).getTime() - new Date(b.slot.start).getTime());

    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [appointments]);
  
  if (isUserLoading || (user && areAppointmentsLoading)) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    // This state is briefly visible before redirect
    return <div className="container mx-auto px-4 md:px-6 py-12">Redirecting...</div>;
  }
  
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
                        <AvatarFallback className="text-xl">{getInitials(appt.doctorName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{appt.doctorName}</h3>
                        <p className="text-muted-foreground">{appt.doctorSpecialty}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(appt.slot.start).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(appt.slot.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{appt.clinicName}</span>
                      </div>
                    </div>
                     <div className="flex md:justify-end gap-2">
                        <Badge variant="default">{appt.status}</Badge>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">You have no upcoming appointments.</p>
              </CardContent>
            </Card>
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
                        <AvatarFallback className="text-xl">{getInitials(appt.doctorName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{appt.doctorName}</h3>
                        <p className="text-muted-foreground">{appt.doctorSpecialty}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                       <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(appt.slot.start).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                       <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(appt.slot.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
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
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">You have no past appointments.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="mb-12">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-6 w-3/4 mt-4" />
      </header>

      <div className="space-y-12">
        <section>
          <Skeleton className="h-8 w-1/4 mb-6" />
          <div className="space-y-6">
            {[...Array(1)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <Skeleton className="h-8 w-1/4 mb-6" />
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
               <Card key={i} className="opacity-50">
                 <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                 </CardContent>
               </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
