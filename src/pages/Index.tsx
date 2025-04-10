
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Users, Badge } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 animate-fadeIn">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="font-heading text-5xl font-bold text-gray-900 leading-tight">
              Discover Amazing Events in Your Community
            </h1>
            <p className="text-lg text-gray-600">
              Join workshops, hackathons, and more. Connect with clubs and organizations that match your interests.
            </p>
            <div className="flex items-center justify-center space-x-4 pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Browse Events
              </Button>
              <Button size="lg" variant="outline">
                Start a Club
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-24 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Calendar className="h-8 w-8 text-primary" />}
                title="Easy Scheduling"
                description="Find and join events that match your schedule and interests"
              />
              <FeatureCard 
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Join Communities"
                description="Connect with clubs and organizations that share your passion"
              />
              <FeatureCard 
                icon={<Badge className="h-8 w-8 text-primary" />}
                title="Track Achievements"
                description="Earn badges and showcase your participation in events"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="card-hover rounded-xl p-6 bg-white">
      <div className="space-y-4">
        {icon}
        <h3 className="font-heading font-semibold text-xl">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default Index;
