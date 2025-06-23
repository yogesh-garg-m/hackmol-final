import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserDetails } from "../utils/supabaseUtils";

export function useSignupListener() {
  useEffect(() => {
    const subscription = supabase
      .channel("profiles_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
        },
        async (payload) => {
          console.log("payload", payload);
          const { new: newRecord } = payload;

          try {
            // Get user details and email
            const [userDetails, emailResponse] = await Promise.all([
              fetchUserDetails(newRecord.id),
              fetch(
                `https://email-server-cs.onrender.com/get-user-email/${newRecord.id}`
              ),
            ]);

            const { email } = await emailResponse.json();

            // Create email content
            const subject = `Welcome to Our Platform!`;
            const content = `Thank you for signing up, ${userDetails.full_name}! Your account has been successfully created.`;

            // Create HTML content with similar styling
            const htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                  <h1 style="margin: 0;">Welcome Aboard!</h1>
                </div>
                <div style="padding: 20px; background-color: #f9fafb;">
                  <h2 style="color: #4f46e5;">Signup Confirmation</h2>
                  <p>Hello <strong>${userDetails.full_name}</strong>,</p>
                  <p>Congratulations! Your account has been successfully created.</p>
                  
                  <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                    <h3 style="margin-top: 0; color: #4f46e5;">Account Details</h3>
                    <p><strong>Name:</strong> ${userDetails.full_name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                  </div>
                  
                  <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #10b981;">
                    <h3 style="margin-top: 0; color: #10b981;">Next Steps</h3>
                    <p>You're all set to explore our platform! Log in to your account to get started. If you have any questions, feel free to contact our support team.</p>
                  </div>
                  
                  <p>Thank you for joining us!</p>
               率先

                  <div style="text-align: center; padding: 15px; color: #6b7280; font-size: 12px; border-top: 1px solid #e0e0e0;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                  </div>
                </div>
              `;

            // Send email
            await fetch("https://email-server-cs.onrender.com/send-direct", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": import.meta.env.VITE_EMAIL_SECRET,
              },
              body: JSON.stringify({
                to: email,
                subject,
                content,
                htmlContent,
              }),
            });

            console.log(
              "Signup confirmation email sent to",
              userDetails.full_name
            );
          } catch (error) {
            console.error("Error handling signup:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
}
