import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-volunteer-DEFAULT via-volunteer-DEFAULT to-volunteer-purple">
      <div className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.2\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          backgroundSize: "60px 60px"
        }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 drop-shadow-sm tracking-tight animate-fade-in">
          Make a Difference Today
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Join hands with us in creating positive change. Discover meaningful volunteering opportunities that match your passion and availability.
        </p>
        <Button 
          variant="outline" 
          className="border-[#2c7c74] text-[#2c7c74] hover:bg-[#2c7c74]/10 animate-fade-in"
          size="lg"
          style={{ animationDelay: "0.4s" }}
        >
          About Our Mission
        </Button>
      </div>
    </div>
  );
};

export default Hero;
