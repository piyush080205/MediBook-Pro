'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDoctors } from '@/lib/data';
import type { Doctor } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Users, Brain, Heart, Baby, Search, Bone } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';

const specialties = [
    { name: 'Cardiology', icon: Heart },
    { name: 'Neurology', icon: Brain },
    { name: 'Pediatrics', icon: Baby },
    { name: 'Dermatology', icon: Users },
    { name: 'Orthopedics', icon: Bone }
];

export default function DoctorsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
    const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '');
    const [compareList, setCompareList] = useState<string[]>([]);
    
    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoading(true);
            const doctors = await getDoctors();
            setAllDoctors(doctors);
            setIsLoading(false);
        };
        fetchDoctors();
    }, []);
    
    const filteredDoctors = useMemo(() => {
        return allDoctors.filter(doctor => {
            const matchesSearch = searchTerm === '' || 
                doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.clinics.some(c => c.location.address.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesSpecialty = selectedSpecialty === '' || doctor.specialties.includes(selectedSpecialty);
            return matchesSearch && matchesSpecialty;
        });
    }, [allDoctors, searchTerm, selectedSpecialty]);

    const handleCompareToggle = (doctorId: string) => {
        setCompareList(prev => 
            prev.includes(doctorId) 
                ? prev.filter(id => id !== doctorId)
                : [...prev, doctorId]
        );
    };

    const handleCompare = () => {
        if (compareList.length > 1) {
            router.push(`/doctors/compare?ids=${compareList.join(',')}`);
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold">Find Your Doctor</h1>
                <p className="text-muted-foreground mt-2 md:text-lg">Search for trusted specialists and book your appointment.</p>
            </header>
            
            <Card className="mb-8 p-6 shadow-lg">
                 <div className="grid md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <Label htmlFor="search">Search by name or location</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                id="search"
                                placeholder="e.g. Dr. Smith or New York"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                     <div>
                        <Button className="w-full" onClick={() => {
                            const params = new URLSearchParams();
                            if (searchTerm) params.set('query', searchTerm);
                            if (selectedSpecialty) params.set('specialty', selectedSpecialty);
                            router.push(`/doctors?${params.toString()}`);
                        }}>
                            <Search className="mr-2 h-4 w-4" /> Search
                        </Button>
                    </div>
                </div>
                 <div className="mt-6">
                    <p className="font-medium mb-3 text-center md:text-left">Filter by specialty</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {specialties.map(({ name, icon: Icon }) => (
                            <Button 
                                key={name}
                                variant={selectedSpecialty === name ? 'default' : 'outline'}
                                onClick={() => setSelectedSpecialty(prev => prev === name ? '' : name)}
                            >
                                <Icon className="mr-2 h-4 w-4"/> {name}
                            </Button>
                        ))}
                    </div>
                 </div>
            </Card>

            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => <DoctorCardSkeleton key={i} />)}
                </div>
            ) : (
                <>
                {filteredDoctors.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDoctors.map(doctor => (
                            <DoctorCard 
                                key={doctor.id} 
                                doctor={doctor} 
                                onCompareToggle={handleCompareToggle}
                                isComparing={compareList.includes(doctor.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground">No doctors found matching your criteria.</p>
                    </div>
                )}
                </>
            )}


            {compareList.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-card p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] border-t z-50">
                    <div className="container mx-auto flex justify-between items-center">
                        <p className="font-semibold">{compareList.length} doctor(s) selected for comparison.</p>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setCompareList([])}>Clear</Button>
                             <Button onClick={handleCompare} disabled={compareList.length < 2}>
                                Compare ({compareList.length})
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DoctorCard({ doctor, onCompareToggle, isComparing }: { doctor: Doctor, onCompareToggle: (id: string) => void, isComparing: boolean }) {
    const doctorImage = PlaceHolderImages.find(p => p.id === doctor.imageId);
    return (
        <Card className="overflow-hidden group flex flex-col">
            <CardContent className="p-0 flex flex-col flex-grow">
                <div className="relative h-48 w-full">
                    {doctorImage &&
                    <Image
                        src={doctorImage.imageUrl}
                        alt={`Photo of ${doctor.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform"
                        data-ai-hint={doctorImage.imageHint}
                    />}
                </div>
                <div className="p-4 space-y-3 flex flex-col flex-grow">
                     <div>
                        <div className="flex justify-between items-start">
                             <Link href={`/doctors/${doctor.id}`} className="block">
                                <h3 className="font-semibold text-lg hover:text-primary transition-colors">{doctor.name}</h3>
                             </Link>
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                                <span>{doctor.ratings.avg.toFixed(1)}</span>
                             </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{doctor.specialties[0]}</p>
                    </div>
                    
                    <div className="flex-grow">
                        {doctor.specialties.slice(0, 2).map(spec => (
                            <Badge key={spec} variant="secondary" className="mr-2 mb-2">{spec}</Badge>
                        ))}
                    </div>
                    
                     <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-2">
                            <Checkbox id={`compare-${doctor.id}`} checked={isComparing} onCheckedChange={() => onCompareToggle(doctor.id)} />
                            <Label htmlFor={`compare-${doctor.id}`} className="text-sm font-medium cursor-pointer">Compare</Label>
                        </div>
                        <Button variant="default" size="sm" asChild>
                            <Link href={`/doctors/${doctor.id}`}>View Profile</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DoctorCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                     <div className="flex items-center justify-between pt-3 border-t">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-9 w-28" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
