import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  eventName: string;
  eventDate: string;
  
  eventLocation: string;
}

const TicketDialog: React.FC<TicketDialogProps> = ({
  isOpen,
  onClose,
  qrCode,
  eventName,
  eventDate,
  eventLocation,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <div className="relative">
          <div className="bg-white p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{eventName}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{eventDate}</p>
                <p>{eventLocation}</p>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <img
                  src={`${qrCode}`}
                  alt="Event Ticket QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Show this QR code at the event entrance</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDialog; 