import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Clock, HeartPulse, Stethoscope, Users, Sparkles } from 'lucide-react';
import { getDoctors } from '@/lib/data';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default async function Home() {
  const doctors = await getDoctors();
  const topDoctors = doctors.slice(0, 4);
  const heroImage = PlaceHolderImages.find(p => p.id === "hero-image-1");

  return (
    <>
      <div className="flex flex-col">
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight">
                Intelligent Healthcare, Instantly.
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80">
                Stop waiting, start healing. MediBook Pro uses AI to find the right doctor, predict wait times, and optimize your appointment, all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="default" size="lg" asChild>
                    <Link href="/triage">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Start Smart Triage
                    </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/doctors">Find a Doctor</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-auto md:aspect-square">
              {heroImage && 
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  priority
                  className="rounded-xl object-cover shadow-2xl"
                  data-ai-hint={heroImage.imageHint}
                />
              }
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">A smarter way to manage your health</h2>
              <p className="text-muted-foreground md:text-lg max-w-3xl mx-auto">
                Our platform is designed to provide a seamless and efficient healthcare experience from start to finish.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent p-3 rounded-full w-fit">
                    <Stethoscope className="h-8 w-8" />
                  </div>
                  <CardTitle>Smart Triage Engine</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Describe your symptoms to get an AI-powered recommendation for the right specialist.</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent p-3 rounded-full w-fit">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <CardTitle>Slot Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Find the best appointment times that fit your schedule and minimize clinic wait times.</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent p-3 rounded-full w-fit">
                    <Clock className="h-8 w-8" />
                  </div>
                  <CardTitle>Queue Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">See real-time wait estimates for clinics before you even leave your home.</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent p-3 rounded-full w-fit">
                    <HeartPulse className="h-8 w-8" />
                  </div>
                  <CardTitle>Emergency Routing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Instantly find the nearest emergency rooms with estimated ETAs and availability.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Meet Our Top Doctors</h2>
              <p className="text-muted-foreground md:text-lg max-w-3xl mx-auto">
                Highly-rated professionals ready to provide you with exceptional care.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {topDoctors.map((doctor) => {
                const doctorImage = PlaceHolderImages.find(p => p.id === doctor.imageId);
                return (
                <Card key={doctor.id} className="overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="relative h-48 w-full">
                       {doctorImage && (
                          <Image
                              src={doctorImage.imageUrl}
                              alt={`Photo of ${doctor.name}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              data-ai-hint={doctorImage.imageHint}
                          />
                       )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {doctorImage && <AvatarImage src={doctorImage.imageUrl} alt={doctor.name} />}
                          <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialties[0]}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pt-2 line-clamp-2">
                          {doctor.qualifications.join(', ')} with {doctor.yearsExperience} years of experience.
                      </p>
                       <Button variant="outline" className="w-full mt-4" asChild>
                          <Link href={`/doctors/${doctor.id}`}>View Profile</Link>
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
             <div className="text-center mt-12">
                <Button size="lg" asChild>
                  <Link href="/doctors">View All Doctors</Link>
                </Button>
              </div>
          </div>
        </section>
      </div>
    </>
  );
}
