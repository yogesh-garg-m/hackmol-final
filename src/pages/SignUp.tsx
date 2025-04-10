
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  User, 
  CheckCircle, 
  AtSign, 
  Lock, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  GitBranch, 
  Droplet 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SignUpFormData, bloodGroupOptions, branchOptions, yearOfStudyOptions } from '@/types/profileTypes';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Basic info, Step 2: Profile info
  const [hoverButton, setHoverButton] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    rollNumber: '',
    yearOfStudy: 1,
    branch: '',
    bloodGroup: 'O+'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof SignUpFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for step 1
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill out all required fields.",
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Passwords don't match",
          description: "Please make sure your passwords match.",
        });
        return;
      }
      
      setStep(2);
      return;
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation for step 2
    if (!formData.username || !formData.rollNumber || !formData.branch || !formData.bloodGroup) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill out all required fields.",
      });
      setLoading(false);
      return;
    }

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
            roll_number: formData.rollNumber,
            year_of_study: formData.yearOfStudy,
            branch: formData.branch,
            blood_group: formData.bloodGroup
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      
      // Redirect to Homepage page
      setTimeout(() => {
        navigate('/homepage');
      }, 1000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message || "An error occurred during sign up.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const formItemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.3 }
    })
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-16 md:pt-24 pb-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
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
                Create an account
              </motion.h1>
              <motion.p 
                className="text-sm text-gray-600 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {step === 1 ? 'Step 1: Basic Information' : 'Step 2: Profile Information'}
              </motion.p>
            </motion.div>

            {step === 1 ? (
              <motion.form 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleNextStep}
              >
                <motion.div 
                  className="space-y-2" 
                  custom={0}
                  variants={formItemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2" 
                  custom={1}
                  variants={formItemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <AtSign className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  custom={2}
                  variants={formItemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  custom={3}
                  variants={formItemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </motion.div>

                <motion.div
                  custom={4}
                  variants={formItemVariants}
                  initial="initial"
                  animate="animate"
                  className="pt-2"
                >
                  <motion.div
                    onMouseEnter={() => setHoverButton(true)}
                    onMouseLeave={() => setHoverButton(false)}
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
                        Next Step
                        {hoverButton && !loading && (
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
                      />
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSignUp}
              >
                <motion.div 
                  className="space-y-2" 
                  custom={0}
                  variants={formItemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2" 
                  custom={1}
                  variants={formItemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Label htmlFor="rollNumber" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Roll Number
                  </Label>
                  <Input
                    id="rollNumber"
                    type="text"
                    placeholder="Enter your roll number"
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                    value={formData.rollNumber}
                    onChange={handleChange}
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  custom={2}
                  variants={formItemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Label htmlFor="yearOfStudy" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Year of Study
                  </Label>
                  <Select
                    value={formData.yearOfStudy.toString()}
                    onValueChange={(value) => handleSelectChange('yearOfStudy', parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOfStudyOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  custom={3}
                  variants={formItemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Label htmlFor="branch" className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Branch
                  </Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => handleSelectChange('branch', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchOptions.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  custom={4}
                  variants={formItemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Label htmlFor="bloodGroup" className="flex items-center gap-2">
                    <Droplet className="h-4 w-4" />
                    Blood Group
                  </Label>
                  <Select
                    value={formData.bloodGroup}
                    onValueChange={(value) => handleSelectChange('bloodGroup', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroupOptions.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={handlePrevStep}
                    type="button"
                  >
                    Back
                  </Button>
                  
                  <motion.div
                    className="flex-1"
                    onMouseEnter={() => setHoverButton(true)}
                    onMouseLeave={() => setHoverButton(false)}
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                        {hoverButton && !loading && (
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
                      />
                    </Button>
                  </motion.div>
                </div>
              </motion.form>
            )}

            <motion.div 
              className="mt-6 text-center text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/signin" className="text-primary hover:underline font-medium relative group">
                  Sign in
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
