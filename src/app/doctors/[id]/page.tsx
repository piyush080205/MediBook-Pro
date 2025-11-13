import Image from 'next/image';
import { getDoctorById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MapPin, Briefcase, GraduationCap, Phone } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import QueuePredictionCard from '@/components/clinics/QueuePredictionCard';
import SlotOptimizerModal from '@/components/appointments/SlotOptimizerModal';
import { Separator } from '@/components/ui/separator';

export default async function DoctorProfilePage({ params }: { params: { id: string } }) {
  const doctor = await getDoctorById(params.id);

  if (!doctor) {
    notFound();
  }

  const doctorImage = PlaceHolderImages.find(p => p.id === doctor.imageId);

  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3">
              <div className="md:col-span-1 relative min-h-[300px] md:min-h-0">
                {doctorImage && (
                  <Image
                    src={doctorImage.imageUrl}
                    alt={`Photo of ${doctor.name}`}
                    fill
                    priority
                    className="object-cover"
                    data-ai-hint={doctorImage.imageHint}
                  />
                )}
              </div>
              <div className="md:col-span-2 p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                     {doctorImage && <AvatarImage src={doctorImage.imageUrl} alt={doctor.name} />}
                    <AvatarFallback className="text-3xl">{getInitials(doctor.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <h1 className="text-3xl md:text-4xl font-headline font-bold">{doctor.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{doctor.ratings.avg.toFixed(1)}</span>
                            <span>({doctor.ratings.count} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            <span>{doctor.yearsExperience} years experience</span>
                        </div>
                    </div>
                     <div className="pt-2">
                        {doctor.specialties.map(spec => (
                            <Badge key={spec} variant="secondary" className="mr-2 mb-2">{spec}</Badge>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <GraduationCap className="w-5 h-5 mt-1 text-accent shrink-0" />
                        <div>
                            <h3 className="font-semibold">Qualifications</h3>
                            <p className="text-muted-foreground">{doctor.qualifications.join(', ')}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 mt-1 text-accent shrink-0" />
                        <div>
                            <h3 className="font-semibold">Primary Location</h3>
                            <p className="text-muted-foreground">{doctor.clinics[0].location.address}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <SlotOptimizerModal doctorId={doctor.id} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12">
            <h2 className="text-2xl md:text-3xl font-headline font-bold mb-6">Clinics</h2>
            <div className="grid md:grid-cols-2 gap-8">
                {doctor.clinics.map(clinic => (
                    <Card key={clinic.id}>
                        <CardHeader>
                            <CardTitle>{clinic.name}</CardTitle>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm pt-1">
                               <MapPin className="w-4 h-4" />
                               <span>{clinic.location.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                               <Phone className="w-4 h-4" />
                               <span>{clinic.contactNumber}</span>
                            </div>
                        </CardHeader>
                        <Separator className="my-2" />
                        <CardContent className="pt-6">
                            <QueuePredictionCard clinicId={clinic.id} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
