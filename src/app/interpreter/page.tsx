'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { runDocumentInterpreter } from '@/app/actions';
import type { MedicalDocument } from '@/ai/flows/document-interpreter-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Upload, Sparkles, Loader2, FileText, HeartPulse, Pill, TestTube2, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function DocumentInterpreterPage() {
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [result, setResult] = useState<MedicalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
        toast({
          title: "File is too large",
          description: "Please upload an image smaller than 4MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentImage(e.target?.result as string);
        setResult(null); // Clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!documentImage) {
      toast({
        title: 'No document uploaded',
        description: 'Please upload an image of your medical document first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const analysisResult = await runDocumentInterpreter({ documentImage });
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: 'The AI could not interpret the document. Please try a clearer image.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetState = () => {
    setDocumentImage(null);
    setResult(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Medical Document Interpreter</h1>
        <p className="text-muted-foreground mt-2 md:text-lg">
          Upload a prescription, lab report, or summary and let AI extract the key information.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Upload Your Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!documentImage ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="mb-2 text-muted-foreground">Drag & drop an image or click to upload</p>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Browse File
                    </Button>
                    <Input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground mt-4">PNG, JPG, or WEBP. Max 4MB.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                        <Image src={documentImage} alt="Uploaded Document" fill className="object-contain"/>
                         <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={resetState}>
                            <X className="h-4 w-4" />
                         </Button>
                    </div>
                    <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Interpret Document
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                    This AI tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                </AlertDescription>
            </Alert>
            {isLoading && (
                 <Card>
                    <CardContent className="p-6 text-center space-y-4">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                        <p className="text-muted-foreground font-medium">AI is analyzing your document... This may take a moment.</p>
                    </CardContent>
                 </Card>
            )}
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Analysis Results</span>
                            <Badge variant="secondary">{result.documentType}</Badge>
                        </CardTitle>
                        <CardDescription>{result.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {result.keyVitals && result.keyVitals.length > 0 && (
                             <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary"/>Key Vitals</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {result.keyVitals.map((vital, i) => (
                                        <div key={i} className="p-3 bg-secondary/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">{vital.name}</p>
                                            <p className="font-bold text-lg">{vital.value} <span className="text-sm font-normal">{vital.unit}</span></p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                         {result.abnormalReadings && result.abnormalReadings.length > 0 && (
                             <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2"><TestTube2 className="h-5 w-5 text-destructive"/>Abnormal Readings</h3>
                                 {result.abnormalReadings.map((reading, i) => (
                                    <Alert key={i} variant="destructive">
                                        <p className="font-bold">{reading.name}: {reading.value} {reading.unit}</p>
                                        <p className="text-sm">{reading.interpretation}</p>
                                    </Alert>
                                ))}
                            </div>
                        )}
                         {result.medications && result.medications.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2"><Pill className="h-5 w-5 text-primary"/>Medications</h3>
                                 <ul className="space-y-2 list-disc list-inside">
                                    {result.medications.map((med, i) => (
                                        <li key={i} className="text-muted-foreground"><span className="font-semibold text-foreground">{med.name}</span> - {med.dosage}, {med.frequency}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {result.nextSteps && result.nextSteps.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2"><ArrowRight className="h-5 w-5 text-primary"/>Next Steps</h3>
                                 <ul className="space-y-2">
                                    {result.nextSteps.map((step, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground shrink-0"/> 
                                            <span className="text-muted-foreground">{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
