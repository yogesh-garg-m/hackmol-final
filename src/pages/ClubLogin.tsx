
import React from "react";
import ClubLoginForm from "@/components/clubs/ClubLoginForm";
import { Toaster } from "@/components/ui/toaster";

const ClubLogin = () => {
  return (
    <>
      <ClubLoginForm />
      <Toaster />
    </>
  );
};

export default ClubLogin;
