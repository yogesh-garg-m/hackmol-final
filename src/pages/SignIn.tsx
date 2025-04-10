import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, User, Users, Shield, BookOpen, CalendarClock, Rocket, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ClubData {
  name: string;
  category: string;
  admin_id: string;
}

interface ClubAuthData {
  club_id: number;
  password: string;
  status: string;
  clubs: ClubData;
}

interface AdminAuthData {
  id: string;
  admin_code: string;
  password: string;
  role: string;
  status: string;
}

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("student");
  const [hoverButton, setHoverButton] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clubCode, setClubCode] = useState('');
  const [clubPassword, setClubPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/homepage');
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/homepage');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    setError(null);
  }, [activeTab]);

  const handleStudentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message,
        });
        setError(error.message);
      } else if (data.user) {
        toast({
          title: "Successfully signed in",
          description: "Welcome back!",
        });
        navigate('/homepage');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please try again later.",
      });
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClubSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const trimmedClubCode = clubCode.trim().toUpperCase();

        console.log("Attempting club sign-in with code:", trimmedClubCode);

        // ✅ Fetch club details even if NOT authenticated (RLS is updated)
        const { data, error } = await supabase
            .from('club_auth')
            .select(`
                club_id,
                password,
                status,
                clubs (
                    name,
                    category,
                    admin_id
                )
            `)
            .eq('club_code', trimmedClubCode)
            .single()
            .returns<ClubAuthData>();

        console.log("Auth response data:", data, "Error:", error);

        if (error) {
            toast({
                variant: "destructive",
                title: "Database error",
                description: "There was an error connecting to the database. Please try again.",
            });
            setError("Database error: " + error.message);
            return;
        }

        if (!data) {
            toast({
                variant: "destructive",
                title: "Invalid club code",
                description: "No club found with this code. Please check and try again.",
            });
            setError("Invalid club code. No club found with code: " + trimmedClubCode);
            return;
        }

        const authData = data;

        if (authData.status !== 'Approved') {
            toast({
                variant: "destructive",
                title: "Club not approved",
                description: `This club is currently ${authData.status.toLowerCase()}. Please contact the administrator.`,
            });
            setError(`Club status is ${authData.status}. Only approved clubs can sign in.`);
            return;
        }

        if (authData.password !== clubPassword) {
            toast({
                variant: "destructive",
                title: "Incorrect password",
                description: "Please check your password and try again.",
            });
            setError("Incorrect password. Please check and try again.");
            return;
        }

        // ✅ Store club session separately (Even if user is NOT logged in)
        sessionStorage.setItem('club_id', authData.club_id.toString());
        sessionStorage.setItem('club_name', authData.clubs.name);
        sessionStorage.setItem('club_category', authData.clubs.category);
        sessionStorage.setItem('club_admin_id', authData.clubs.admin_id);
        sessionStorage.setItem('club_logged_in', 'true'); // Flag for club session

        toast({
            title: "Club Login Successful",
            description: `Welcome to ${authData.clubs.name} dashboard!`,
        });

        navigate('/club/dashboard');
    } catch (error) {
        console.error("Club login error:", error);
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "An error occurred during login. Please try again.",
        });
        setError("An unexpected error occurred during login.");
    } finally {
        setLoading(false);
    }
};


  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const trimmedAdminCode = adminCode.trim();
      console.log("Attempting admin login with code:", trimmedAdminCode);
    
      // Fetch admin record by admin_code
      const { data, error } = await supabase
        .from('admin')
        .select('id, admin_code, password')
        .eq('admin_code', trimmedAdminCode)
        .maybeSingle();
    
      if (error) {
        console.error("Admin login error:", error);
        toast({
          variant: "destructive",
          title: "Invalid Admin Code",
          description: "No admin found with this code. Please check and try again.",
        });
        setError("Invalid admin code.");
        return;
      }

      if (!data) {
        toast({
          variant: "destructive",
          title: "Invalid Admin Code",
          description: "No admin found with this code. Please check and try again.",
        });
        setError("Invalid admin code.");
        return;
      }
    
      // Check if the password matches
      if (data.password !== adminPassword) {
        toast({
          variant: "destructive",
          title: "Incorrect Password",
          description: "The password you entered is incorrect. Please try again.",
        });
        setError("Incorrect password.");
        return;
      }
    
      // Store admin session details
      sessionStorage.setItem('admin_id', data.id);
      sessionStorage.setItem('admin_logged_in', 'true'); // Flag for admin session
    
      toast({
        title: "Admin Login Successful",
        description: "Welcome back!",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
      });
      setError("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
    
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  const formItemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.3 }
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const iconBoxVariants = {
    initial: { opacity: 0.8, scale: 1 },
    hover: { opacity: 1, scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)', transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-16 md:pt-24">
        <div className="flex flex-col md:flex-row min-h-[600px] bg-white rounded-lg shadow-xl overflow-hidden">
          <motion.div 
            className={`w-full md:w-[45%] p-6 lg:p-10 flex items-center justify-center order-2 md:order-1 ${activeTab !== 'student' ? 'md:order-2' : 'md:order-1'}`}
            layout
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            <div className={`max-w-md w-full ${activeTab !== 'student' ? 'md:ml-auto' : ''}`}>
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div 
                  className="flex justify-center mb-4"
                  whileHover={{ 
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <Calendar className="h-10 w-10 text-primary" />
                </motion.div>
                <motion.h1 
                  className="font-heading text-2xl font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  Welcome back
                </motion.h1>
                <motion.p 
                  className="text-sm text-gray-600 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  Sign in to your account to continue
                </motion.p>
              </motion.div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <Tabs defaultValue="student" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6 relative overflow-hidden">
                  <motion.div 
                    className="absolute bg-primary/10 inset-0 rounded-md z-0"
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                      width: '33.33%',
                      left: activeTab === 'student' ? '0%' : activeTab === 'club-lead' ? '33.33%' : '66.66%'
                    }}
                  />
                  
                  <TabsTrigger value="student" className="flex items-center gap-2 relative z-10">
                    <User className="h-4 w-4" />
                    <span>Student</span>
                  </TabsTrigger>
                  <TabsTrigger value="club-lead" className="flex items-center gap-2 relative z-10">
                    <Users className="h-4 w-4" />
                    <span>Club Lead</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center gap-2 relative z-10">
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="student" key="student">
                    <motion.form 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleStudentSignIn}
                    >
                      <motion.div 
                        className="space-y-2" 
                        custom={0}
                        variants={formItemVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </motion.div>

                      <motion.div 
                        className="space-y-2"
                        custom={1}
                        variants={formItemVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </motion.div>

                      <motion.div
                        custom={2}
                        variants={formItemVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <motion.div
                          onMouseEnter={() => setHoverButton('student')}
                          onMouseLeave={() => setHoverButton(null)}
                          variants={buttonVariants}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button 
                            className="w-full relative overflow-hidden group" 
                            size="lg"
                            type="submit"
                            disabled={loading}
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              {loading ? 'Signing In...' : 'Sign In'}
                              {hoverButton === 'student' && !loading && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                >
                                  <Sparkles className="h-4 w-4" />
                                </motion.span>
                              )}
                            </span>
                            <motion.span 
                              className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              layoutId="buttonBackground"
                            />
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="club-lead" key="club-lead">
                    <motion.form 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleClubSignIn}
                    >
                      <motion.div 
                        className="space-y-2"
                        custom={0}
                        variants={formItemVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <Label htmlFor="club-code">Club Code</Label>
                        <Input
                          id="club-code"
                          type="text"
                          placeholder="Enter your club code"
                          className="w-full transition-all duration-300 focus:ring-2 focus:ring-secondary/50 font-mono tracking-wider text-center uppercase"
                          value={clubCode}
                          onChange={(e) => setClubCode(e.target.value.toUpperCase())}
                          maxLength={5}
                          minLength={5}
                          required
                        />
                        <p className="text-xs text-gray-500">5-character code (letters and numbers)</p>
                      </motion.div>

                      <motion.div 
                        className="space-y-2"
                        custom={1}
                        variants={formItemVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <Label htmlFor="club-password">Password</Label>
                        <Input
                          id="club-password"
                          type="password"
                          placeholder="Enter your password"
                          className="w-full transition-all duration-300 focus:ring-2 focus:ring-secondary/50"
                          value={clubPassword}
                          onChange={(e) => setClubPassword(e.target.value)}
                          required
                        />
                      </motion.div>

                      <motion.div
                        custom={2}
                        variants={formItemVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <motion.div
                          onMouseEnter={() => setHoverButton('club')}
                          onMouseLeave={() => setHoverButton(null)}
                          variants={buttonVariants}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button 
                            className="w-full relative overflow-hidden group" 
                            size="lg" 
                            variant="secondary"
                            type="submit"
                            disabled={loading}
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              {loading ? 'Signing In...' : 'Sign In as Club Lead'}
                              {hoverButton === 'club' && !loading && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                >
                                  <Sparkles className="h-4 w-4" />
                                </motion.span>
                              )}
                            </span>
                            <motion.span 
                              className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              layoutId="buttonBackground"
                            />
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="admin" key="admin">
                    <motion.form 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleAdminSignIn}
                    >
                      <motion.div 
                        className="space-y-2"
                        custom={0}
                        variants={formItemVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <Label htmlFor="admin-code">Admin Code</Label>
                        <Input
                          id="admin-code"
                          type="text"
                          placeholder="Enter admin code"
                          className="w-full transition-all duration-300 focus:ring-2 focus:ring-purple-400"
                          value={adminCode}
                          onChange={(e) => setAdminCode(e.target.value)}
                          required
                        />
                      </motion.div>

                      <motion.div 
                        className="space-y-2"
                        custom={1}
                        variants={formItemVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="Enter your password"
                          className="w-full transition-all duration-300 focus:ring-2 focus:ring-purple-400"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                        />
                      </motion.div>

                      <motion.div
                        custom={2}
                        variants={formItemVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <motion.div
                          onMouseEnter={() => setHoverButton('admin')}
                          onMouseLeave={() => setHoverButton(null)}
                          variants={buttonVariants}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button 
                            className="w-full relative overflow-hidden group" 
                            size="lg" 
                            style={{ backgroundColor: "rgb(124, 58, 237)" }}
                            type="submit"
                            disabled={loading}
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              {loading ? 'Signing In...' : 'Sign In as Admin'}
                              {hoverButton === 'admin' && !loading && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                >
                                  <Sparkles className="h-4 w-4" />
                                </motion.span>
                              )}
                            </span>
                            <motion.span 
                              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              layoutId="buttonBackground"
                            />
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.form>
                  </TabsContent>
                </AnimatePresence>

              </Tabs>

              <motion.div 
                className="mt-6 text-center text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary hover:underline font-medium relative group">
                    Sign up
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className={`w-full md:w-[55%] bg-gradient-to-br ${
              activeTab === 'student' 
                ? 'from-primary/10 to-secondary/10' 
                : activeTab === 'club-lead' 
                  ? 'from-secondary/10 to-primary/10' 
                  : 'from-indigo-100 to-purple-100'
            } p-8 flex items-center justify-center order-1 md:order-2 ${activeTab !== 'student' ? 'md:order-1' : 'md:order-2'}`}
            layout
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            <AnimatePresence mode="wait">
              {activeTab === 'student' && (
                <motion.div 
                  className="text-center"
                  key="student-illustration"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="rounded-full bg-primary/20 p-6 inline-block mb-4"
                    whileHover={iconBoxVariants.hover}
                    initial={iconBoxVariants.initial}
                  >
                    <BookOpen size={80} className="text-primary" />
                  </motion.div>
                  <motion.h2 
                    className="text-2xl font-heading font-bold mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    Access College Resources
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 max-w-md mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    Sign in to browse upcoming events, book study rooms, 
                    access course materials, and connect with student clubs.
                  </motion.p>
                  <motion.div 
                    className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-md text-center card-hover"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    >
                      <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-sm font-medium">Events</p>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-md text-center card-hover"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ delay: 0.1 }}
                    >
                      <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-sm font-medium">Courses</p>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-md text-center card-hover"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ delay: 0.2 }}
                    >
                      <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-sm font-medium">Clubs</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'club-lead' && (
                <motion.div 
                  className="text-center"
                  key="club-lead-illustration"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="rounded-full bg-secondary/20 p-6 inline-block mb-4"
                    whileHover={iconBoxVariants.hover}
                    initial={iconBoxVariants.initial}
                  >
                    <CalendarClock size={80} className="text-secondary" />
                  </motion.div>
                  <motion.h2 
                    className="text-2xl font-heading font-bold mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    Manage Club Events
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 max-w-md mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    Create and manage events, track attendance, communicate with members,
                    and promote your club activities across campus.
                  </motion.p>
                  <motion.div 
                    className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-md text-center card-hover"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    >
                      <CalendarClock className="h-8 w-8 mx-auto text-secondary mb-2" />
                      <p className="text-sm font-medium">Schedule</p>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-md text-center card-hover"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ delay: 0.1 }}
                    >
                      <Users className="h-8 w-8 mx-auto text-secondary mb-2" />
                      <p className="text-sm font-medium">Members</p>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-md text-center card-hover"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ delay: 0.2 }}
                    >
                      <Rocket className="h-8 w-8 mx-auto text-secondary mb-2" />
                      <p className="text-sm font-medium">Promote</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'admin' && (
                <motion.div 
                  className="text-center"
                  key="admin-illustration"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="rounded-full bg-purple-200 p-6 inline-block mb-4"
                    whileHover={iconBoxVariants.hover}
                    initial={iconBoxVariants.initial}
                  >
                    <Shield size={80} className="text-purple-700" />
                  </motion.div>
                  <motion.h2 
                    className="text-2xl font-heading font-bold mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    College Administration
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 max-w-md mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    Manage campus resources, approve club events, 
                    monitor student activities, and ensure campus safety.
                  </motion.p>
                  <motion.div 
                    className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-md text-center card-hover"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    >
                      <Calendar className="h-8 w-8 mx-auto text-purple-700 mb-2" />
                      <p className="text-sm font-medium">Approvals</p>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-md text-center card-hover"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ delay: 0.1 }}
                    >
                      <Users className="h-8 w-8 mx-auto text-purple-700 mb-2" />
                      <p className="text-sm font-medium">Users</p>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-md text-center card-hover"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ delay: 0.2 }}
                    >
                      <Shield className="h-8 w-8 mx-auto text-purple-700 mb-2" />
                      <p className="text-sm font-medium">Security</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
