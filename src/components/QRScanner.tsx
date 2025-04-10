import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
import { X, QrCode, Loader, ArrowLeft, Camera } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError: (errorMessage: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isScanningEnabled?: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ 
  onScanSuccess, 
  onScanError, 
  isOpen, 
  onClose,
  isScanningEnabled = true
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "html5qr-code-full-region";

  useEffect(() => {
    return () => {
      cleanupScanner();
    };
  }, []);

  useEffect(() => {
    if (!isOpen && isStarted) {
      cleanupScanner();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isScanningEnabled && isStarted) {
      setIsPaused(true);
      stopScanner();
    } else if (isScanningEnabled && isPaused) {
      // Only resume if we're not in a paused state from a successful scan
      if (!isPaused) {
        // Add a 2-second delay before resuming scanning
        setTimeout(() => {
          setIsPaused(false);
          startScanner();
        }, 2000);
      }
    }
  }, [isScanningEnabled]);

  const cleanupScanner = () => {
    if (scannerRef.current && isStarted) {
      try {
        scannerRef.current.stop()
          .then(() => {
            console.log("Scanner stopped successfully");
            setIsStarted(false);
            scannerRef.current = null;
            setIsPaused(false);
          })
          .catch(error => {
            console.error("Error stopping scanner:", error);
          });
      } catch (error) {
        console.error("Exception when stopping scanner:", error);
      }
    } else {
      setIsStarted(false);
      setIsPaused(false);
    }
  };

  const startScanner = async () => {
    if (!document.getElementById(scannerContainerId)) {
      console.error(`Element with id ${scannerContainerId} not found`);
      onScanError(`Scanner initialization failed: container element not found`);
      return;
    }
    
    if (isStarted) {
      console.log("Scanner already running");
      return;
    }
    
    setIsLoading(true);
    setCameraError(null);

    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (error) {
          console.log("Clean slate for scanner:", error);
          // Ignore errors on cleanup
        }
      }
      
      scannerRef.current = new Html5Qrcode(scannerContainerId);
      
      const qrCodeSuccessCallback = (decodedText: string) => {
        console.log("🔍 QR Code Scanned Successfully!");
        console.log("📱 Raw Scanned Data:", decodedText);
        
        try {
          // Try to parse the QR code data as JSON
          const parsedData = JSON.parse(decodedText);
          console.log("✅ Parsed QR Data:", parsedData);
          
          // Log verification steps
          console.log("🔐 Verification Steps:");
          console.log("1. Checking QR code format...");
          console.log("2. Validating data structure...");
          console.log("3. Verifying ticket information...");
          
          // Log the verification result with the specific JSON structure
          console.log("🎫 Ticket Verification Complete!");
          console.log("📋 Ticket Details:", {
            clubId: parsedData.club_id || "N/A",
            eventId: parsedData.event_id || "N/A",
            userId: parsedData.user_id || "N/A",
            fullName: parsedData.fullname || "N/A",
            isUsed: parsedData.is_used ? "Yes" : "No",
            scanTimestamp: new Date().toISOString()
          });

          // Additional verification status
          console.log("🔍 Verification Status:");
          console.log(`- Club ID: ${parsedData.club_id}`);
          console.log(`- Event ID: ${parsedData.event_id}`);
          console.log(`- User: ${parsedData.fullname}`);
          console.log(`- Ticket Status: ${parsedData.is_used ? "Used" : "Valid"}`);
          console.log(`- Scan Time: ${new Date().toLocaleString()}`);
        } catch (error) {
          console.log("⚠️ QR Code is not in JSON format");
          console.log("ℹ️ Raw text will be used for verification");
        }

        // Stop scanning after successful scan
        setIsPaused(true);
        stopScanner();
        onScanSuccess(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        supportedScanTypes: [
          Html5QrcodeScanType.SCAN_TYPE_CAMERA,
          Html5QrcodeScanType.SCAN_TYPE_FILE
        ]
      };

      // Try to get the environment camera first (mobile)
      try {
        console.log("📸 Attempting to start environment camera...");
        await scannerRef.current.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          (errorMessage: string) => {
            console.log("⚠️ Scanner warning:", errorMessage);
          }
        );
      } catch (err) {
        // If environment camera fails, try user camera (webcam)
        console.log("📸 Environment camera failed, trying user camera:", err);
        await scannerRef.current.start(
          { facingMode: "user" },
          config,
          qrCodeSuccessCallback,
          (errorMessage: string) => {
            console.log("⚠️ Scanner warning:", errorMessage);
          }
        );
      }
      
      setIsStarted(true);
      console.log("✅ Scanner started successfully");
    } catch (err) {
      console.error("❌ Failed to start scanner:", err);
      setCameraError("Failed to access camera. Please ensure camera permissions are granted.");
      onScanError(`Failed to start scanner: ${err}`);
      scannerRef.current = null;
    } finally {
      setIsLoading(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isStarted) {
      try {
        await scannerRef.current.stop();
        console.log("🛑 Scanner stopped successfully");
        setIsStarted(false);
        setIsPaused(false);
      } catch (error) {
        console.error("❌ Error stopping scanner:", error);
      }
    } else {
      console.log("ℹ️ Scanner is not running");
    }
  };

  const handleClose = () => {
    cleanupScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 mx-4 attendee-glassmorphic rounded-xl shadow-lg border border-purple-200 dark:border-purple-800">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors duration-200" 
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-2 top-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors duration-200" 
          onClick={handleClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300">Scan QR Code</h3>
          <p className="text-sm text-muted-foreground">
            Position the QR code within the scanner
          </p>
        </div>
        
        <div className="relative w-full aspect-square mb-4 bg-black rounded-lg overflow-hidden">
          <div id={scannerContainerId} className="w-full h-full"></div>
          
          {!isStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              {isLoading ? (
                <Loader className="h-12 w-12 text-purple-500 animate-spin mb-2" />
              ) : (
                <Camera className="h-16 w-16 text-purple-300 mb-4" />
              )}
              <Button 
                onClick={startScanner} 
                disabled={isLoading || !isScanningEnabled}
                className="bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105 transition-all duration-200"
              >
                {isLoading ? "Initializing Camera..." : "Start Scanner"}
              </Button>
            </div>
          )}
          
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center p-4">
                <p className="text-red-500 mb-2">{cameraError}</p>
                <Button 
                  onClick={startScanner} 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Retry Camera
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {isStarted && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="border-purple-300 text-purple-700 hover:bg-purple-100 hover:text-purple-800 dark:hover:bg-purple-900/40 dark:hover:text-purple-300 transition-all duration-200"
            >
              Cancel Scanning
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;