'use client';

import { useState, useEffect } from 'react';
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
import { Stethoscope, Sparkles, Loader2, Activity, ArrowRightCircle, ShieldAlert, HeartPulse, HelpCircle } from 'lucide-react';
import { runSmartTriage } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import type { SmartTriageOutput } from '@/ai/flows/smart-triage-engine';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';


const triageFormSchema = z.object({
  symptoms: z.string().min(5, {
    message: "Please describe your symptoms or question in at least 5 characters.",
  }),
  age: z.coerce.number().min(0).max(120).optional(),
  gender: z.enum(["M", "F", "O"]).optional(),
  chronicFlags: z.string().optional(),
});

const LAST_TRIAGE_RESULT_KEY = 'lastTriageResult';

export default function TriagePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<SmartTriageOutput | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    if (!navigator.onLine) {
        const cachedResult = localStorage.getItem(LAST_TRIAGE_RESULT_KEY);
        if (cachedResult) {
            setTriageResult(JSON.parse(cachedResult));
        }
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const form = useForm<z.infer<typeof triageFormSchema>>({
    resolver: zodResolver(triageFormSchema),
    defaultValues: {
      symptoms: "",
      age: undefined,
      chronicFlags: "",
    },
  });

  async function onSubmit(values: z.infer<typeof triageFormSchema>) {
    if (!isOnline) {
        toast({
            title: "You are offline",
            description: "Please connect to the internet to run a new analysis.",
            variant: "destructive",
        });
        return;
    }
    setIsLoading(true);
    setTriageResult(null);
    try {
      const result = await runSmartTriage({
          ...values,
          symptoms: values.symptoms.split(',').map(s => s.trim()),
          chronicFlags: values.chronicFlags?.split(',').map(s => s.trim()).filter(s => s),
      });
      setTriageResult(result);
      localStorage.setItem(LAST_TRIAGE_RESULT_KEY, JSON.stringify(result));
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing your request. Please try again.",
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
    localStorage.removeItem(LAST_TRIAGE_RESULT_KEY);
  }
  
  const getRiskCategoryClass = (category: 'low' | 'medium' | 'high' | undefined) => {
    switch (category) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  }

  const renderResult = () => {
    if (!triageResult) return null;

    if (triageResult.isQuery) {
        return (
            <div className="space-y-6 pt-4">
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                        <HelpCircle className="h-6 w-6 text-primary" />
                        First-Aid Information
                    </h3>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Procedure Explanation:</h4>
                    <ul className="space-y-2">
                        {triageResult.procedureExplanation?.map((step, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <ArrowRightCircle className="w-4 h-4 mt-1 text-primary shrink-0"/> 
                                <span className="text-muted-foreground">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button variant="ghost" onClick={resetForm} disabled={!isOnline}>Ask Another Question</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-4">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">AI Triage & Risk Assessment Result</h3>
                 <div className={cn('inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-base font-bold', getRiskCategoryClass(triageResult.riskCategory))}>
                    <HeartPulse className="h-5 w-5"/>
                    <span>Risk Level: {triageResult.riskCategory?.toUpperCase()} ({triageResult.riskScore}/100)</span>
                </div>
            </div>

            <div className="rounded-lg border bg-card p-4 grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                    <Stethoscope className="w-5 h-5 mt-1 text-primary shrink-0" />
                    <div>
                        <h4 className="font-semibold">Recommended Specialty</h4>
                        <p className="text-muted-foreground">{triageResult.recommendedSpecialty}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 mt-1 text-primary shrink-0"/>
                    <div>
                        <h4 className="font-semibold">Urgency Level</h4>
                        <p className="text-muted-foreground capitalize">{triageResult.urgency}</p>
                    </div>
                </div>
            </div>

            {triageResult.contributingFactors && triageResult.contributingFactors.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">Contributing Factors:</h4>
                    <div className="flex flex-wrap gap-2">
                        {triageResult.contributingFactors.map((factor, i) => (
                            <Badge key={i} variant="secondary">{factor}</Badge>
                        ))}
                    </div>
                </div>
            )}

            {triageResult.explanation && triageResult.explanation.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">Explanation:</h4>
                     <ul className="space-y-2">
                        {triageResult.explanation.map((step, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <ArrowRightCircle className="w-4 h-4 mt-1 text-muted-foreground shrink-0"/> 
                                <span className="text-muted-foreground">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {triageResult.suggestedNextSteps && triageResult.suggestedNextSteps.length > 0 && (
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
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button variant="ghost" onClick={resetForm} disabled={!isOnline}>Start Over</Button>
                {triageResult.recommendedSpecialty && (
                    <Button onClick={handleFindDoctor} className="flex-1" disabled={!isOnline}>
                        Find a {triageResult.recommendedSpecialty}
                    </Button>
                )}
            </div>
        </div>
    );
  }

  return (
     <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
        <Card className="w-full max-w-2xl">
           <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-3xl">
                <Sparkles className="text-accent h-8 w-8" />
                Smart Assistant
            </CardTitle>
            <CardDescription className='flex items-center gap-2 border-l-4 border-destructive pl-3 text-destructive'>
                <ShieldAlert className='h-4 w-4 shrink-0' />
                This AI is for informational purposes and is not a substitute for professional medical advice.
            </CardDescription>
            </CardHeader>
            <CardContent>
                 {!triageResult ? (
                    <>
                    {!isOnline && (
                         <Alert variant="destructive" className="mb-6">
                            <WifiOff className="h-4 w-4" />
                            <AlertTitle>You are currently offline</AlertTitle>
                            <AlertDescription>
                                You can't run a new analysis, but you can view your last result if available.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="symptoms"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base">Describe your symptoms or ask a first-aid question</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="e.g., chest pain, shortness of breath OR how to apply a bandage"
                                    className="resize-none"
                                    rows={4}
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="chronicFlags"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base">Pre-existing Conditions (Optional, for triage)</FormLabel>
                                <FormControl>
                                <Input
                                    placeholder="e.g., diabetes, hypertension, asthma"
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
                        
                        <Button type="submit" disabled={isLoading || !isOnline} className="w-full" size="lg">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Analyze
                        </Button>
                        </form>
                    </Form>
                    </>
                    ) : (
                    <div>
                        {!isOnline && (
                             <Alert variant="destructive" className="mb-6">
                                <WifiOff className="h-4 w-4" />
                                <AlertTitle>You are offline</AlertTitle>
                                <AlertDescription>
                                    Showing last saved result. Connect to the internet to run a new analysis.
                                </AlertDescription>
                            </Alert>
                        )}
                        {renderResult()}
                    </div>
                    )}
            </CardContent>
        </Card>
    </div>
  );
}
