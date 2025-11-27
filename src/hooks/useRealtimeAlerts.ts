"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  lga_id: string;
  case_count: number;
  ai_confidence_score: number;
  created_at: string;
  lga: {
    name: string;
    state: {
      name: string;
      code: string;
    };
  };
}

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState<Alert | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Fetch initial alerts
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('outbreak_alerts')
        .select(`
          *,
          lga:lgas(name, state:states(name, code))
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching alerts:', error);
      } else {
        setAlerts(data || []);
      }
      setLoading(false);
    };

    fetchAlerts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('alerts_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'outbreak_alerts',
        },
        (payload) => {
          const newAlert = payload.new as Alert;
          setNewAlert(newAlert);
          setAlerts(prev => [newAlert, ...prev]);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(`New Lassa Fever Alert: ${newAlert.title}`, {
              body: `Severity: ${newAlert.severity.toUpperCase()}`,
              icon: '/virus.png',
              tag: `alert-${newAlert.id}`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'outbreak_alerts',
        },
        (payload) => {
          const updatedAlert = payload.new as Alert;
          setAlerts(prev => 
            prev.map(alert => 
              alert.id === updatedAlert.id ? updatedAlert : alert
            )
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Clear new alert notification
  const clearNewAlert = () => {
    setNewAlert(null);
  };

  return {
    alerts,
    loading,
    newAlert,
    clearNewAlert,
    requestNotificationPermission,
  };
}
