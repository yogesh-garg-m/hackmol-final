import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Users,
  Calendar,
  Trophy,
  Zap,
  Mail,
  Globe,
  Brain,
  Heart,
  MapPin,
  Search,
  Shield,
  Sparkles,
  QrCode,
  Camera,
  BookOpen,
  GraduationCap,
  Target,
  Star,
  Lightbulb,
  Clock,
  Award,
  Megaphone,
  Coffee,
  UserCog,
  Settings,
  CheckCircle,
  Play,
} from "lucide-react";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { MessageDialog } from "@/components/ui/message-dialog";

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY: motionScrollY } = useScroll();

  // Header transparency based on scroll
  const headerOpacity = useTransform(motionScrollY, [0, 100], [0.7, 0.95]);
  const headerBlur = useTransform(motionScrollY, [0, 100], [20, 40]);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const features = [
    { icon: Users, title: "Smart Clubs", desc: "AI-powered club matching" },
    { icon: Calendar, title: "Events Hub", desc: "Seamless event discovery" },
    { icon: QrCode, title: "QR Attendance", desc: "One-tap check-ins" },
    { icon: Brain, title: "AI Matching", desc: "Connect with like minds" },
    { icon: Trophy, title: "Achievements", desc: "Track your progress" },
    { icon: Lightbulb, title: "Innovation", desc: "Spark new ideas" },
    { icon: Target, title: "Goals", desc: "Set and achieve targets" },
    { icon: Star, title: "Recognition", desc: "Get noticed for your work" },
    { icon: Clock, title: "Real-time", desc: "Live updates and alerts" },
    { icon: Award, title: "Competitions", desc: "Campus-wide contests" },
    { icon: Megaphone, title: "Announcements", desc: "Stay informed" },
    { icon: Coffee, title: "Social", desc: "Connect over coffee" },
    { icon: BookOpen, title: "Resources", desc: "Academic materials" },
    { icon: Shield, title: "Security", desc: "Safe environment" },
    { icon: Zap, title: "Fast Access", desc: "Quick navigation" },
    { icon: Globe, title: "Global Connect", desc: "International network" },
  ];

  const serviceFeatures = {
    student: [
      "Browse and join clubs easily",
      "Access AI-moderated academic resources",
      "Discover campus events and participants",
      "Collaborate or create teams for projects",
      "Connect with like-minded peers",
      "Real-time AI notifications",
    ],
    club: [
      "Create and manage events with ease",
      "Secure and fast attendee management",
      "Send announcements",
      "Manage club resources",
      "Analytics and insights",
      "Manage Club Members",
    ],
    admin: [
      "Monitor all campus activities",
      "User management system",
      "Generate detailed reports about everything",
      "Security oversight & emergency alerts",
      "System configuration",
      "Data analytics interactive dashboard",
    ],
  };

  const handleCardHover = (cardType: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDialogPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setHoveredCard(cardType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-hidden">
      {/* Fixed Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: `rgba(15, 23, 42, ${0.7 + scrollY * 0.001})`,
          backdropFilter: `blur(${Math.min(scrollY * 0.1, 20)}px)`,
          borderBottom:
            scrollY > 50 ? "1px solid rgba(255,255,255,0.1)" : "none",
        }}
      >
        <div className="container mx-auto px-6 flex justify-between items-center h-16">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Campus SETU
            </span>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            {["Features", "Services", "About", "Contact"].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-300 hover:text-white transition-colors relative group"
                whileHover={{ y: -2 }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}
          </nav>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg"
              onClick={() => navigate("/signin")}
            >
              Login
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Honeycomb Background */}
          <div
            className="absolute inset-0 honeycomb-bg opacity-30"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.3) 0%, transparent 300px), url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Cpath d='M22 38V14l11-7v24l-11 7zm0 0l11 7h22l-11-7H22zm0-24l11-7h22l-11 7H22z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 52px",
              transition: "background 0.3s ease",
            }}
          />

          {/* Fade overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/80 pointer-events-none" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-8"
            >
              <motion.h1
                className="text-6xl md:text-8xl font-bold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2 }}
              >
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Campus SETU
                </span>
              </motion.h1>

              <motion.div
                className="text-2xl md:text-4xl text-gray-300 font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Connect. <span className="text-blue-400">Collaborate.</span>{" "}
                <span className="text-purple-400">Contribute.</span>
              </motion.div>

              <motion.p
                className="text-lg text-gray-400 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Transforming student life through smart campus engagement
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl border-0"
                    onClick={() => navigate("/signup")}
                  >
                    Explore Campus <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-800 text-gray-800 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                    onClick={() => navigate("/signup")}
                  >
                    Join Now
                  </Button>
                </motion.div>
              </motion.div>

              {/* Live Stats */}
              <motion.div
                className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {[
                  { count: "1,423+", label: "Events" },
                  { count: "312", label: "Clubs" },
                  { count: "8,756", label: "Students" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="text-2xl font-bold text-blue-400">
                      {stat.count}
                    </div>
                    <div className="text-gray-500 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Infinite Scroll Section */}
        <FeaturesInfiniteScroll features={features} />

        {/* Services Section */}
        <section id="services" className="py-16 relative">
          <div className="container mx-auto px-6">
            {/* Services Heading */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                Services
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Discover our comprehensive platform designed for every member of
                the campus community
              </p>
            </motion.div>

            <ServicesSection
              serviceFeatures={serviceFeatures}
              hoveredCard={hoveredCard}
              dialogPosition={dialogPosition}
              onCardHover={handleCardHover}
              onCardLeave={() => setHoveredCard(null)}
            />
          </div>
        </section>

        {/* About Section */}
        <AboutSection />

        {/* Footer */}
        <FooterSection />
      </main>
    </div>
  );
};

// Features Infinite Scroll Component
const FeaturesInfiniteScroll = ({ features }: { features: any[] }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  // Split features into two arrays for two rows
  const firstRowFeatures = features.slice(0, Math.ceil(features.length / 2));
  const secondRowFeatures = features.slice(Math.ceil(features.length / 2));

  return (
    <section ref={ref} id="features" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Smart Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover powerful tools designed to enhance your campus experience
          </p>
        </motion.div>

        {/* First Row - Left to Right */}
        <div className="relative mb-8 overflow-hidden">
          <motion.div
            className="flex gap-6 w-max"
            animate={{
              x: [0, -1920],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
            whileHover={{ animationPlayState: "paused" }}
            style={{ animationPlayState: "running" }}
          >
            {[
              ...firstRowFeatures,
              ...firstRowFeatures,
              ...firstRowFeatures,
            ].map((feature, index) => (
              <FeatureCard key={`first-${index}`} feature={feature} />
            ))}
          </motion.div>
        </div>

        {/* Second Row - Right to Left */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-6 w-max"
            animate={{
              x: [-1920, 0],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
            whileHover={{ animationPlayState: "paused" }}
            style={{ animationPlayState: "running" }}
          >
            {[
              ...secondRowFeatures,
              ...secondRowFeatures,
              ...secondRowFeatures,
            ].map((feature, index) => (
              <FeatureCard key={`second-${index}`} feature={feature} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Individual Feature Card Component
const FeatureCard = ({ feature }: { feature: any }) => {
  return (
    <motion.div
      className="group cursor-pointer p-6 bg-gray-800/30 border border-gray-700 backdrop-blur-sm transition-all duration-500 hover:bg-gray-700/40 min-w-[200px] flex-shrink-0"
      whileHover={{
        scale: 1.05,
        rotateY: 10,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="flex flex-col items-center text-center space-y-3"
        whileHover={{ z: 10 }}
      >
        <feature.icon className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
        <h3 className="font-semibold text-white">{feature.title}</h3>
        <p className="text-sm text-gray-400">{feature.desc}</p>
      </motion.div>

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0"
        initial={{ boxShadow: "0 0 0px rgba(59, 130, 246, 0)" }}
        whileHover={{
          boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

// Services Section with Updated Cards
const ServicesSection = ({
  serviceFeatures,
  hoveredCard,
  dialogPosition,
  onCardHover,
  onCardLeave,
}: {
  serviceFeatures: any;
  hoveredCard: string | null;
  dialogPosition: { x: number; y: number };
  onCardHover: (cardType: string, event: React.MouseEvent) => void;
  onCardLeave: () => void;
}) => {
  return (
    <section id="services" className="py-8 relative">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Student Portal */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-xl p-8 border border-blue-500/20 rounded-xl cursor-pointer transition-all duration-300"
            onMouseEnter={(e) => onCardHover("student", e)}
            onMouseLeave={onCardLeave}
          >
            <div className="text-center">
              <GraduationCap className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">
                Student Portal
              </h3>
              <p className="text-gray-300 mb-6">
                Access events, clubs, and campus resources
              </p>
              <div className="bg-black/20 p-4 mb-6 rounded-lg">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Connect • Explore • Engage
                </p>
              </div>
            </div>
          </motion.div>

          {/* Club Admin Page */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl p-8 border border-purple-500/20 rounded-xl cursor-pointer transition-all duration-300"
            onMouseEnter={(e) => onCardHover("club", e)}
            onMouseLeave={onCardLeave}
          >
            <div className="text-center">
              <UserCog className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">Club Admin</h3>
              <p className="text-gray-300 mb-6">
                Manage your club events and members
              </p>
              <div className="bg-black/20 p-4 mb-6 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Create • Manage • Track</p>
              </div>
            </div>
          </motion.div>

          {/* Admin Page */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 backdrop-blur-xl p-8 border border-emerald-500/20 rounded-xl cursor-pointer transition-all duration-300"
            onMouseEnter={(e) => onCardHover("admin", e)}
            onMouseLeave={onCardLeave}
          >
            <div className="text-center">
              <Settings className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">
                Admin Panel
              </h3>
              <p className="text-gray-300 mb-6">
                Oversee campus activities and analytics
              </p>
              <div className="bg-black/20 p-4 mb-6 rounded-lg">
                <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Monitor • Control • Analyze
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Message Box Dialog */}
      <MessageDialog
        isVisible={!!hoveredCard}
        position={dialogPosition}
        features={hoveredCard ? serviceFeatures[hoveredCard] : []}
      />
    </section>
  );
};

// About Section with Video
const AboutSection = () => {
  return (
    <section
      id="about"
      className="py-16 bg-gradient-to-b from-transparent to-gray-900/50"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            About Campus SETU
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            Discover how we're revolutionizing campus life through innovative
            technology and seamless connectivity. Join thousands of students
            already transforming their university experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-white/10">
            <div className="aspect-video relative group">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/1PeyPCuwj2o?si=83P7WO6Rlr-dE4mf"
                title="Campus SETU Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </motion.div>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                See Campus SETU in Action
              </h3>
              <p className="text-gray-400">
                Watch how students, clubs, and administrators use our platform
                to create meaningful connections and streamline campus
                activities.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer Section
const FooterSection = () => {
  return (
    <footer
      id="contact"
      className="py-20 bg-gradient-to-t from-black to-gray-900"
    >
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Your Campus, Reimagined
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Ready to transform your university experience? Join thousands of
            students already connected.
          </p>

          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-12 py-4 text-lg font-semibold border-0 shadow-2xl"
            >
              Get Started Today <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-gray-400 flex items-center gap-2">
                Developed with{" "}
                <Heart className="h-4 w-4 text-red-500" fill="currentColor" />{" "}
                by Yogesh
              </p>
              <div className="flex items-center gap-2 text-gray-500">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:gargy947@gmail.com"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  gargy947@gmail.com
                </a>
              </div>
              <p className="text-sm text-gray-600">
                &copy; 2024 Campus SETU. Revolutionizing university life.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Index;
