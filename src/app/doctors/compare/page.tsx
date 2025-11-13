'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getDoctorById } from '@/lib/data';
import type { Doctor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Briefcase, MapPin } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompareDoctorsPage() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const doctorIds = searchParams.get('ids')?.split(',') || [];
    if (doctorIds.length > 0) {
      const fetchDoctors = async () => {
        setIsLoading(true);
        const promises = doctorIds.map(id => getDoctorById(id));
        const results = await Promise.all(promises);
        setDoctors(results.filter((doc): doc is Doctor => doc !== undefined));
        setIsLoading(false);
      };
      fetchDoctors();
    } else {
        setIsLoading(false);
    }
  }, [searchParams]);

  if (isLoading) {
    return <CompareSkeleton />;
  }
  
  if (doctors.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-4">Compare Doctors</h1>
        <p className="text-muted-foreground mb-6">No doctors selected for comparison.</p>
        <Button asChild>
            <Link href="/doctors">Back to Search</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-headline">Compare Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Feature</TableHead>
                  {doctors.map(doctor => {
                    const doctorImage = PlaceHolderImages.find(p => p.id === doctor.imageId);
                    return(
                        <TableHead key={doctor.id} className="min-w-[250px] text-center">
                            <div className="flex flex-col items-center gap-2">
                                <Avatar className="h-20 w-20">
                                    {doctorImage && <AvatarImage src={doctorImage.imageUrl} />}
                                    <AvatarFallback className="text-2xl">{getInitials(doctor.name)}</AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-foreground">{doctor.name}</span>
                                <span className="text-sm text-muted-foreground">{doctor.specialties[0]}</span>
                            </div>
                        </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Specialties</TableCell>
                  {doctors.map(doctor => (
                    <TableCell key={doctor.id} className="text-center">{doctor.specialties.join(', ')}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Rating</TableCell>
                  {doctors.map(doctor => (
                    <TableCell key={doctor.id} className="text-center">{doctor.ratings.avg.toFixed(1)} ({doctor.ratings.count} reviews)</TableCell>
                  ))}
                </TableRow>
                 <TableRow>
                  <TableCell className="font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-500" /> Experience</TableCell>
                  {doctors.map(doctor => (
                    <TableCell key={doctor.id} className="text-center">{doctor.yearsExperience} years</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold flex items-center gap-2"><span className="font-bold text-green-500">₹</span> Consultation Fee</TableCell>
                  {doctors.map(doctor => (
                    <TableCell key={doctor.id} className="text-center">₹{doctor.fees.toFixed(2)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500" /> Primary Clinic</TableCell>
                  {doctors.map(doctor => (
                    <TableCell key={doctor.id} className="text-center text-xs">{doctor.clinics[0].name}, {doctor.clinics[0].location.address}</TableCell>
                  ))}
                </TableRow>
                 <TableRow>
                  <TableCell></TableCell>
                  {doctors.map(doctor => (
                    <TableCell key={doctor.id} className="text-center">
                        <Button asChild>
                            <Link href={`/doctors/${doctor.id}`}>View Profile</Link>
                        </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


function CompareSkeleton() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <Card>
                <CardHeader>
                    <Skeleton className="h-10 w-1/3" />
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">
                                        <Skeleton className="h-6 w-24" />
                                    </TableHead>
                                    {[1, 2].map(i => (
                                        <TableHead key={i} className="min-w-[250px] text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Skeleton className="h-20 w-20 rounded-full" />
                                                <Skeleton className="h-6 w-32" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[1,2,3,4,5].map(i => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-6 w-40 mx-auto" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-6 w-40 mx-auto" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                </CardContent>
            </Card>
        </div>
    )
}
