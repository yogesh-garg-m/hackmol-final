import React, { useEffect, useState, useRef } from 'react';
import { Scroll } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NewsletterAlert {
  id: string;
  heading: string;
  content: string;
  created_at: string;
}

const NewsletterAlertsPanel = () => {
  const [alerts, setAlerts] = useState<NewsletterAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    fetchAlerts();
    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('alert_newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = async () => {
    // Unsubscribe from any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Create new subscription
    subscriptionRef.current = supabase
      .channel('newsletter_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alert_newsletters'
        },
        (payload) => {
          console.log('Newsletter alert change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setAlerts(prev => [payload.new as NewsletterAlert, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(a => a.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev => 
              prev.map(a => a.id === payload.new.id ? payload.new as NewsletterAlert : a)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
  };

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-700 hover:bg-blue-200',
      'bg-purple-100 text-purple-700 hover:bg-purple-200',
      'bg-green-100 text-green-700 hover:bg-green-200',
      'bg-orange-100 text-orange-700 hover:bg-orange-200',
      'bg-pink-100 text-pink-700 hover:bg-pink-200',
      'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      'bg-teal-100 text-teal-700 hover:bg-teal-200',
      'bg-rose-100 text-rose-700 hover:bg-rose-200'
    ];
    return colors[index % colors.length];
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          ref={triggerRef}
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Scroll className="h-5 w-5" />
          {alerts.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {alerts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[450px] p-0 bg-white/95 backdrop-blur-sm" 
        align="start"
        sideOffset={5}
        style={{ 
          transform: 'translateX(-40%)',
          marginLeft: '20px'
        }}
      >
        <div className="h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No alerts found</div>
          ) : (
            <div className="divide-y divide-red-100">
              {alerts.map((alert, index) => (
                <div 
                  key={alert.id} 
                  className={`p-4 transition-all duration-200 hover:bg-gray-50/80 ${
                    index % 2 === 0 ? 'hover:bg-red-50/50' : 'hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900 hover:text-primary transition-colors duration-200">
                      {alert.heading}
                    </h5>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${getTagColor(index)}`}>
                      {getTimeAgo(alert.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {alert.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NewsletterAlertsPanel; 