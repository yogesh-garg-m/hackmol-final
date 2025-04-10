import React from 'react';
import { Check, X, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'error' | 'warning' | null;

interface VerificationStatusProps {
  status: StatusType;
  title: string;
  message: string;
  onClose: () => void;
  attendeeName?: string;
  onGoBack?: () => void;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status,
  title,
  message,
  onClose,
  attendeeName,
  onGoBack
}) => {
  if (!status) return null;

  const statusIcons = {
    success: <Check className="h-12 w-12 text-green-500" />,
    error: <X className="h-12 w-12 text-red-500" />,
    warning: <AlertTriangle className="h-12 w-12 text-amber-500" />
  };

  const statusClasses = {
    success: 'bg-green-50 border-green-100 dark:bg-green-900/20',
    error: 'bg-red-50 border-red-100 dark:bg-red-900/20',
    warning: 'bg-amber-50 border-amber-100 dark:bg-amber-900/20'
  };

  const statusButtonClasses = {
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 transform hover:scale-105 transition-all duration-200',
    error: 'bg-red-600 hover:bg-red-700 active:bg-red-800 transform hover:scale-105 transition-all duration-200',
    warning: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transform hover:scale-105 transition-all duration-200'
  };

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in',
    )}>
      <div className={cn(
        'relative w-full max-w-md p-6 mx-4 attendee-glassmorphic rounded-xl shadow-lg border',
        statusClasses[status]
      )}>
        {onGoBack && (
          <Button 
            onClick={onGoBack} 
            variant="ghost" 
            size="icon" 
            className="absolute left-2 top-2 text-muted-foreground hover:bg-background/50 hover:text-foreground transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div className="text-center mb-4 flex flex-col items-center">
          <div className="mb-4 bg-white dark:bg-black/20 p-4 rounded-full shadow-inner">
            {statusIcons[status]}
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
          {attendeeName && (
            <p className="text-lg font-semibold mt-2">{attendeeName}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {message}
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={onClose}
            className={cn(
              "px-6 mt-2",
              statusButtonClasses[status]
            )}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;