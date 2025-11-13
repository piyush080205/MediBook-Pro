"use client";

import { useState, useEffect } from 'react';
import { runQueuePrediction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Clock, Wifi, WifiOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface QueuePredictionCardProps {
    clinicId: string;
}

export default function QueuePredictionCard({ clinicId }: QueuePredictionCardProps) {
    const [prediction, setPrediction] = useState<{
        patientsAhead: number;
        estimatedWaitMinutes: number;
        confidence: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrediction = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await runQueuePrediction({
                    clinicId: clinicId,
                    time: new Date().toISOString(),
                });
                setPrediction(result);
            } catch (err) {
                console.error("Queue prediction failed:", err);
                setError("Could not fetch wait times.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrediction();
        const interval = setInterval(fetchPrediction, 60000); // Refresh every minute

        return () => clearInterval(interval);
    }, [clinicId]);

    const renderContent = () => {
        if (isLoading && !prediction) {
            return (
                <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-24 text-destructive">
                    <WifiOff className="h-8 w-8 mb-2" />
                    <p className="text-sm font-semibold">{error}</p>
                </div>
            );
        }

        if (prediction) {
            return (
                <div className="space-y-4">
                    <div className="flex justify-around text-center">
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <span className="text-2xl font-bold">{prediction.patientsAhead}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Patients Ahead</p>
                        </div>
                        <div className="space-y-1">
                             <div className="flex items-center justify-center gap-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <span className="text-2xl font-bold">{prediction.estimatedWaitMinutes}</span>
                             </div>
                            <p className="text-xs text-muted-foreground">Est. Wait (min)</p>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-medium text-muted-foreground">Prediction Confidence</p>
                            <p className="text-xs font-bold">{Math.round(prediction.confidence * 100)}%</p>
                        </div>
                        <Progress value={prediction.confidence * 100} className="h-2" />
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div>
            <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Live Queue Prediction
            </h4>
            {renderContent()}
        </div>
    );
}
