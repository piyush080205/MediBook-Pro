
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Loader2, User as UserIcon, Phone, Trash2, PlusCircle, ShieldAlert } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { User as AppUser, EmergencyContact } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const emergencyContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (e.g., +919876543210)'),
});

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user, isUserLoading]);

  const { data: userData, isLoading: isProfileLoading, error } = useDoc<AppUser>(userDocRef);

  const form = useForm<z.infer<typeof emergencyContactSchema>>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: { name: '', phone: '' },
  });

  // Redirect if user is not logged in or is anonymous
  useEffect(() => {
    if (!isUserLoading && (!user || user.isAnonymous)) {
      toast({
        title: 'Access Denied',
        description: 'You must be logged in to view your profile.',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  // Create user profile if it doesn't exist
  useEffect(() => {
    if (user && !isProfileLoading && !userData && !error && firestore) {
      const createProfile = async () => {
        const newUserDoc: AppUser = {
          id: user.uid,
          name: user.displayName || 'New User',
          email: user.email || undefined,
          phone: user.phoneNumber || '',
          role: 'patient',
          createdAt: new Date().toISOString(),
          emergencyContacts: [],
        };
        try {
          await setDoc(doc(firestore, 'users', user.uid), newUserDoc);
        } catch (e) {
          console.error("Error creating user profile:", e);
        }
      };
      createProfile();
    }
  }, [user, userData, isProfileLoading, error, firestore]);

  const onAddContact = async (values: z.infer<typeof emergencyContactSchema>) => {
    if (!userDocRef) return;
    if (userData?.emergencyContacts && userData.emergencyContacts.length >= 3) {
      toast({
        title: 'Contact Limit Reached',
        description: 'You can only add up to 3 emergency contacts.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateDoc(userDocRef, {
        emergencyContacts: arrayUnion(values),
      });
      toast({ title: 'Contact Added', description: `${values.name} has been added.` });
      form.reset();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Could not add contact.', variant: 'destructive' });
    }
  };

  const onRemoveContact = async (contact: EmergencyContact) => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, {
        emergencyContacts: arrayRemove(contact),
      });
      toast({ title: 'Contact Removed', description: `${contact.name} has been removed.` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Could not remove contact.', variant: 'destructive' });
    }
  };

  if (isUserLoading || isProfileLoading) {
    return <ProfileSkeleton />;
  }
  
  if (!user || user.isAnonymous) {
      // This will be shown briefly before the redirect effect kicks in
      return <div className="container mx-auto px-4 md:px-6 py-12">Redirecting...</div>
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2 md:text-lg">Manage your account details and emergency contacts.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ''} />}
                <AvatarFallback className="text-3xl">
                  {getInitials(user.displayName || user.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{user.displayName || 'Guest User'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>Add up to 3 trusted contacts for emergency situations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-8">
                {userData?.emergencyContacts && userData.emergencyContacts.length > 0 ? (
                  userData.emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onRemoveContact(contact)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No emergency contacts added yet.</p>
                )}
              </div>

              {(!userData?.emergencyContacts || userData.emergencyContacts.length < 3) && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddContact)} className="space-y-4 p-4 border rounded-lg">
                     <h4 className="font-semibold text-center md:text-left">Add New Contact</h4>
                     <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Contact Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="+919876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     </div>
                    <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                      {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <PlusCircle className="mr-2 h-4 w-4" />
                      )}
                      Add Contact
                    </Button>
                  </form>
                </Form>
              )}
               {userData?.emergencyContacts && userData.emergencyContacts.length === 3 && (
                   <div className="text-center p-4 border-dashed border-2 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">You have reached the maximum number of emergency contacts.</p>
                   </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <header className="mb-12">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-6 w-1/2 mt-4" />
            </header>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Skeleton className="h-24 w-24 rounded-full mb-4" />
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-4 w-48 mt-2" />
                        </CardHeader>
                    </Card>
                </div>
                 <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64 mt-2" />
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4 mb-8">
                                <Skeleton className="h-16 w-full" />
                             </div>
                              <div className="p-4 border rounded-lg">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                                <Skeleton className="h-10 w-36 mt-4" />
                              </div>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
}
    