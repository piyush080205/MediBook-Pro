
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, ShieldAlert, Mic, Square, User, Bot, Volume2, Play } from 'lucide-react';
import { runSmartTriage, runTextToSpeech } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import type { SmartTriageOutput } from '@/ai/flows/smart-triage-engine';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  content: React.ReactNode;
  triageResult?: SmartTriageOutput | null;
  audioContent?: string;
};

const chatFormSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
});

export default function TriagePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [audioPlaybackState, setAudioPlaybackState] = useState<'playing' | 'stopped'>('stopped');
  const router = useRouter();
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });
  
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
    });
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        content: "Hello! I'm your AI Health Assistant. You can describe your symptoms for a triage assessment or ask a simple first-aid question (e.g., 'how to treat a minor burn')."
      }
    ])
  }, []);

  useEffect(() => {
    // Request microphone permission on page load
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // We don't need to do anything with the stream, just having it confirms permission.
        // We can immediately stop the tracks to turn off the microphone indicator.
        stream.getTracks().forEach(track => track.stop());
        console.log("Microphone permission granted.");
      })
      .catch(err => {
        toast({
            title: "Microphone Access Denied",
            description: "To use voice commands, please enable microphone access in your browser settings.",
            variant: "destructive"
        });
        console.error("Microphone permission error:", err);
      });
      
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          form.setValue('message', transcript);
          form.handleSubmit(onSubmit)(); 
      };
      
      recognition.onerror = (event: any) => {
          let description = `Could not recognize speech: ${event.error}. Please try again.`;
          if (event.error === 'network') {
            description = 'Could not connect to the voice recognition service. Please check your internet connection.';
          } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            description = 'Microphone access was denied. Please enable it in your browser settings.';
          }
          toast({ title: 'Voice Error', description, variant: 'destructive' });
          setIsListening(false);
      };

      recognition.onend = () => {
          setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [form]);


  const speak = async (text: string) => {
    setAudioPlaybackState('playing');
    try {
      const { audio: audioDataUri } = await runTextToSpeech(text);
      if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play();
        audioRef.current.onended = () => setAudioPlaybackState('stopped');
      }
    } catch (error) {
      console.error('Text-to-speech failed:', error);
      setAudioPlaybackState('stopped');
      toast({
        title: 'Audio Playback Error',
        description: 'Could not play the audio response.',
        variant: 'destructive',
      });
    }
  }

  async function onSubmit(values: z.infer<typeof chatFormSchema>) {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: values.message,
    };
    setMessages(prev => [...prev, userMessage]);
    form.reset();
    setIsLoading(true);

    try {
      const lastMessage = messages[messages.length - 1];
      if (values.message.toLowerCase().includes('yes') && lastMessage?.content.toString().includes('find a')) {
        const lastAiMessage = messages.slice().reverse().find(m => m.sender === 'ai' && m.triageResult);
        if (lastAiMessage && lastAiMessage.triageResult?.recommendedSpecialty) {
          router.push(`/doctors?specialty=${lastAiMessage.triageResult.recommendedSpecialty}`);
          setIsLoading(false);
          return;
        }
      }

      const result = await runSmartTriage({
          symptoms: values.message.split(/\s*,\s*|\s+and\s+/i),
      });

      let audioContent = '';
      if (result.isQuery) {
        audioContent = result.procedureExplanation?.join(' ') || '';
      } else {
        audioContent = `${result.explanation?.join(' ')} Would you like me to find a ${result.recommendedSpecialty} for you?`;
      }
      
      const aiResponseContent = result.isQuery ? (
          <ProcedureExplanation procedure={result.procedureExplanation} onListen={() => speak(audioContent)} audioState={audioPlaybackState} />
      ) : (
          <TriageResult result={result} onListen={() => speak(audioContent)} audioState={audioPlaybackState} />
      );

      const aiMessage: Message = {
          id: Date.now().toString() + '-ai',
          sender: 'ai',
          content: aiResponseContent,
          triageResult: result,
          audioContent: audioContent,
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage: Message = {
          id: Date.now().toString() + '-error',
          sender: 'ai',
          content: "Sorry, I encountered an error. Please try again.",
      }
      setMessages(prev => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({ title: "Voice Not Supported", description: "Your browser doesn't support voice recognition.", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
        setIsListening(true);
        recognitionRef.current.start();
      }).catch(() => {
         toast({
            title: "Microphone Access Denied",
            description: "Please enable microphone access in your browser settings to use voice commands.",
            variant: "destructive"
        });
      })
    }
  };

  return (
     <div className="container mx-auto px-0 md:px-6 py-8 flex justify-center h-[calc(100vh-100px)]">
        <audio ref={audioRef} className="hidden" />
        <Card className="w-full max-w-3xl flex flex-col">
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
            <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2 space-y-6 p-4">
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex items-end gap-3", message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                     {message.sender === 'ai' && (
                        <Avatar className='h-8 w-8'>
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                     )}
                     <div className={cn("max-w-md rounded-2xl p-4", message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none')}>
                        {typeof message.content === 'string' ? <p>{message.content}</p> : message.content}
                     </div>
                      {message.sender === 'user' && (
                        <Avatar className='h-8 w-8'>
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                     )}
                  </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                        <Avatar className='h-8 w-8'>
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <div className={cn("max-w-xs rounded-2xl p-4 bg-secondary rounded-bl-none")}>
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
            </CardContent>
            <div className="p-4 border-t">
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                    <Input 
                        {...form.register('message')} 
                        placeholder={isListening ? "Listening..." : "Type your symptoms or ask a question..."} 
                        autoComplete='off' 
                        disabled={isLoading || isListening} 
                    />
                    <Button type="button" size="icon" variant={isListening ? 'destructive' : 'secondary'} onClick={handleMicClick} disabled={isLoading}>
                        {isListening ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button type="submit" disabled={isLoading || isListening}>Send</Button>
                </form>
            </div>
        </Card>
    </div>
  );
}

interface ResultComponentProps {
    onListen: () => void;
    audioState: 'playing' | 'stopped';
}

function TriageResult({ result, onListen, audioState }: { result: SmartTriageOutput } & ResultComponentProps) {
  const router = useRouter();
  const getRiskCategoryClass = (category: 'low' | 'medium' | 'high' | undefined) => {
    switch (category) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  }

  if (!result || result.isQuery) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold', getRiskCategoryClass(result.riskCategory))}>
            <span>Risk: {result.riskCategory?.toUpperCase()} ({result.riskScore}/100)</span>
        </div>
        <Button variant="outline" size="sm" onClick={onListen} disabled={audioState === 'playing'}>
            {audioState === 'playing' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Volume2 className="h-4 w-4 mr-2" />}
            Listen
        </Button>
      </div>
      
      <p><span className="font-semibold">Urgency:</span> <span className="capitalize">{result.urgency}</span></p>
      <p><span className="font-semibold">Recommended Specialty:</span> {result.recommendedSpecialty}</p>

      {result.explanation && result.explanation.length > 0 && (
          <div>
              <h4 className="font-semibold mb-1">Explanation:</h4>
              <p className="text-sm">{result.explanation.join(' ')}</p>
          </div>
      )}
       {result.suggestedNextSteps && result.suggestedNextSteps.length > 0 && (
          <div>
              <h4 className="font-semibold mb-1">Next Steps:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                  {result.suggestedNextSteps.map((step, i) => <li key={i}>{step}</li>)}
              </ul>
          </div>
      )}
      {result.recommendedSpecialty && (
         <Button size="sm" className="mt-2" onClick={() => router.push(`/doctors?specialty=${result.recommendedSpecialty}`)}>Find a {result.recommendedSpecialty}</Button>
      )}
    </div>
  );
}

function ProcedureExplanation({ procedure, onListen, audioState }: { procedure?: string[] } & ResultComponentProps) {
    if (!procedure || procedure.length === 0) return null;
    return (
        <div className="space-y-3">
             <div className="flex justify-between items-start">
                <h4 className="font-semibold">First-Aid Information:</h4>
                <Button variant="outline" size="sm" onClick={onListen} disabled={audioState === 'playing'}>
                    {audioState === 'playing' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Volume2 className="h-4 w-4 mr-2" />}
                    Listen
                </Button>
            </div>
            <ul className="list-disc list-inside text-sm space-y-1">
                {procedure.map((step, i) => (
                    <li key={i}>{step}</li>
                ))}
            </ul>
             <Alert variant="destructive" className="mt-4">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                    This is for informational purposes. Always consult a medical professional for serious injuries.
                </AlertDescription>
            </Alert>
        </div>
    )
}
