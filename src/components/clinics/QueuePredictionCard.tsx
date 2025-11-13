"use client";

import { useState, useEffect } from 'react';
import { runGetClinicStats } from '@/app/actions';
import { Loader2, Users, Clock, Wifi, WifiOff, BarChart, Sun, Moon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface QueuePredictionCardProps {
    clinicId: string;
}

type ClinicStats = {
    queueLength: number;
    predictedWaitMins: number;
    doctorAvailability: number;
    peakForecast: { time: string; load: number }[];
    noShowProbability: number;
};


export default function QueuePredictionCard({ clinicId }: QueuePredictionCardProps) {
    const [stats, setStats] = useState<ClinicStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await runGetClinicStats({ clinicId });
                setStats(result);
            } catch (err) {
                console.error("Clinic stats failed:", err);
                setError("Could not fetch live stats.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
        // Optional: Refresh data periodically
        // const interval = setInterval(fetchStats, 60000); 
        // return () => clearInterval(interval);
    }, [clinicId]);

    const renderContent = () => {
        if (isLoading && !stats) {
            return (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-40 text-destructive">
                    <WifiOff className="h-8 w-8 mb-2" />
                    <p className="text-sm font-semibold">{error}</p>
                </div>
            );
        }

        if (stats) {
            const peakHour = stats.peakForecast.reduce((max, hour) => hour.load > max.load ? hour : max, stats.peakForecast[0]);

            return (
                 <TooltipProvider>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="space-y-1 rounded-md bg-secondary/50 p-2">
                                <div className="flex items-center justify-center gap-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-2xl font-bold">{stats.queueLength}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Queue Length</p>
                            </div>
                            <div className="space-y-1 rounded-md bg-secondary/50 p-2">
                                 <div className="flex items-center justify-center gap-2">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-2xl font-bold">{stats.predictedWaitMins}</span>
                                 </div>
                                <p className="text-xs text-muted-foreground">Est. Wait (min)</p>
                            </div>
                        </div>

                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-xs font-medium text-muted-foreground">Doctor Availability</p>
                                <p className="text-xs font-bold">{Math.round(stats.doctorAvailability * 100)}%</p>
                            </div>
                            <Progress value={stats.doctorAvailability * 100} className="h-2" />
                        </div>

                        <div className='text-sm text-muted-foreground'>
                            <h4 className="font-semibold text-foreground mb-2">Peak Hour Forecast</h4>
                            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-2">
                               <div className="flex items-center gap-2">
                                    {peakHour.time.includes("PM") ? <Moon className="h-4 w-4 text-blue-400" /> : <Sun className="h-4 w-4 text-yellow-400" />}
                                    <span>Peak demand expected around <span className="font-bold text-foreground">{peakHour.time}</span></span>
                               </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="destructive">High Load</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Consider booking appointments outside of this time for shorter waits.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </TooltipProvider>
            );
        }

        return null;
    };

    return (
        <div>
            <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Live Operational Stats
            </h4>
            {renderContent()}
        </div>
    );
}
