'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope, Sparkles, Loader2, BarChart, Activity, ArrowRightCircle } from 'lucide-react';
import { runSmartTriage } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import type { SmartTriageOutput } from '@/ai/flows/smart-triage-engine';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const triageFormSchema = z.object({
  symptoms: z.string().min(10, {
    message: "Please describe your symptoms in at least 10 characters.",
  }),
  age: z.coerce.number().min(0).max(120).optional(),
  gender: z.enum(["M", "F", "O"]).optional(),
});

export default function TriagePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<SmartTriageOutput | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof triageFormSchema>>({
    resolver: zodResolver(triageFormSchema),
    defaultValues: {
      symptoms: "",
      age: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof triageFormSchema>) {
    setIsLoading(true);
    setTriageResult(null);
    try {
      const result = await runSmartTriage({
          ...values,
          symptoms: values.symptoms.split(',').map(s => s.trim()),
      });
      setTriageResult(result);
    } catch (error) {
      toast({
        title: "Triage Failed",
        description: "An error occurred while analyzing your symptoms. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFindDoctor = () => {
    if (triageResult?.recommendedSpecialty) {
        router.push(`/doctors?specialty=${triageResult.recommendedSpecialty}`);
    }
  };

  const resetForm = () => {
    form.reset();
    setTriageResult(null);
  }

  return (
     <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
        <Card className="w-full max-w-2xl">
           <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-3xl">
                <Sparkles className="text-accent h-8 w-8" />
                Smart Triage
            </CardTitle>
            <CardDescription>
                Describe your symptoms, and our AI will suggest the right specialist for you. This is not medical advice.
            </CardDescription>
            </CardHeader>
            <CardContent>
                 {!triageResult ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="symptoms"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base">Symptoms</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="e.g., chest pain, shortness of breath, headache"
                                    className="resize-none"
                                    rows={4}
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Age (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 35" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Gender (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="M">Male</SelectItem>
                                    <SelectItem value="F">Female</SelectItem>
                                    <SelectItem value="O">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        
                        <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Analyze Symptoms
                        </Button>
                        </form>
                    </Form>
                    ) : (
                    <div className="space-y-6 pt-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold">AI Triage Result</h3>
                            <p className="text-muted-foreground">Based on the symptoms you provided.</p>
                        </div>
                        <div className="rounded-lg border bg-secondary/50 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Recommended Specialty</span>
                                <Badge variant="default" className="text-base">{triageResult.recommendedSpecialty}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-2"><Activity className="w-5 h-5" /> Urgency Level</span>
                                <Badge variant={triageResult.urgency === 'high' ? 'destructive' : 'secondary'} className="capitalize text-base">{triageResult.urgency}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-2"><BarChart className="w-5 h-5" /> Confidence</span>
                                <span className="font-semibold">{Math.round(triageResult.confidence * 100)}%</span>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-2">Suggested Next Steps:</h4>
                            <ul className="space-y-2">
                                {triageResult.suggestedNextSteps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <ArrowRightCircle className="w-4 h-4 mt-1 text-primary shrink-0"/> 
                                        <span className="text-muted-foreground">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                            <Button variant="ghost" onClick={resetForm}>Start Over</Button>
                            <Button onClick={handleFindDoctor} className="flex-1">
                                Find a {triageResult.recommendedSpecialty}
                            </Button>
                        </div>
                    </div>
                    )}
            </CardContent>
        </Card>
    </div>
  );
}
