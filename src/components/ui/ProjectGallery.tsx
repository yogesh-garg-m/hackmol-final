import React, { useState } from "react";
import { OpeningMedia } from "@/types/project";
import { ChevronLeft, ChevronRight, Image, X } from "lucide-react";

interface ProjectGalleryProps {
  media?: OpeningMedia[];
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ media }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  if (!media || media.length === 0) return null;
  
  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));
  };
  
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };
  
  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  
  return (
    <div className="space-y-4 animate-slide-up">
      <h3 className="text-lg font-semibold">Project Gallery</h3>
      
      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3">
        {media.slice(0, 3).map((item, index) => (
          <div 
            key={index} 
            className="relative aspect-video overflow-hidden rounded-lg cursor-pointer hover-lift"
            onClick={() => openLightbox(index)}
          >
            {item.media_type === "Image" ? (
              <img 
                src={item.media_url}
                alt={`Project media ${index + 1}`}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/10 dark:bg-white/5">
                <Image size={24} className="text-primary" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300"></div>
          </div>
        ))}
        
        {media.length > 3 && (
          <div 
            className="absolute -bottom-10 right-0 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={() => openLightbox(3)}
          >
            View all {media.length} images
          </div>
        )}
      </div>
      
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            aria-label="Close lightbox"
          >
            <X size={20} className="text-white" />
          </button>
          
          <button
            onClick={handlePrevious}
            className="absolute left-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
          
          <div className="w-[90vw] h-[80vh] flex items-center justify-center">
            {media[currentIndex].media_type === "Image" ? (
              <img 
                src={media[currentIndex].media_url}
                alt={`Project media ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain animate-scale-in"
              />
            ) : (
              <div className="w-full h-full max-w-2xl max-h-xl flex items-center justify-center bg-black/50">
                <Image size={48} className="text-white/50" />
              </div>
            )}
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-white" : "bg-white/30"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;