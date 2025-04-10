import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserDetails } from '../utils/supabaseUtils';

export function useEventRegistrationListener() {
  useEffect(() => {
    const subscription = supabase
      .channel('event_registrations_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE)
          schema: 'public',
          table: 'event_registrations',
        },
        async (payload) => {
          console.log('payload', payload);
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          // For INSERT events
          if (eventType === 'INSERT') {
            try {
              // Get user details and email separately
              const [userDetails, emailResponse] = await Promise.all([
                fetchUserDetails(newRecord.user_id),
                fetch(`http://localhost:3000/get-user-email/${newRecord.user_id}`)
              ]);
              
              const { email } = await emailResponse.json();
              
              // Get event details
              const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('name, datetime, location')
                .eq('event_id', newRecord.event_id)
                .single();
                
              if (eventError) throw eventError;
              
              // Format date for email
              const eventDate = new Date(eventData.datetime);
              const formattedDate = eventDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              // Create email content
              const subject = `Event Registration Confirmation: ${eventData.name}`;
              const content = `Your registration for ${eventData.name} has been received.`;
              
              // Create HTML content with better styling
              const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                  <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                    <h1 style="margin: 0;">Event Registration</h1>
                  </div>
                  <div style="padding: 20px; background-color: #f9fafb;">
                    <h2 style="color: #4f46e5;">Registration Confirmation</h2>
                    <p>Hello <strong>${userDetails.full_name}</strong>,</p>
                    <p>Your registration for <strong>${eventData.name}</strong> has been received and is currently <strong>pending review</strong>.</p>
                    
                    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                      <h3 style="margin-top: 0; color: #4f46e5;">Event Details</h3>
                      <p><strong>Event:</strong> ${eventData.name}</p>
                      <p><strong>Date & Time:</strong> ${formattedDate}</p>
                      <p><strong>Location:</strong> ${eventData.location}</p>
                    </div>
                    
                    <p>We will notify you once your registration has been reviewed.</p>
                    <p>Thank you for your interest in our event!</p>
                  </div>
                  <div style="text-align: center; padding: 15px; color: #6b7280; font-size: 12px; border-top: 1px solid #e0e0e0;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                  </div>
                </div>
              `;
              
              // Send email
              await fetch('http://localhost:3000/send-direct', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: email,
                  subject,
                  content,
                  htmlContent
                }),
              });
              
              console.log('Registration confirmation email sent to', userDetails.full_name);
            } catch (error) {
              console.error('Error handling event registration:', error);
            }
          }
          
          // For UPDATE events (status changes)
          if (eventType === 'UPDATE' && oldRecord.status !== newRecord.status) {
            try {
              // Get user details and email separately
              const [userDetails, emailResponse] = await Promise.all([
                fetchUserDetails(newRecord.user_id),
                fetch(`http://localhost:3000/get-user-email/${newRecord.user_id}`)
              ]);
              
              const { email } = await emailResponse.json();
              
              // Get event details
              const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('name, datetime, location')
                .eq('event_id', newRecord.event_id)
                .single();
                
              if (eventError) throw eventError;
              
              // Format date for email
              const eventDate = new Date(eventData.datetime);
              const formattedDate = eventDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              // Determine email content based on status
              let subject, content, statusColor, statusMessage;
              
              switch (newRecord.status) {
                case 'accepted':
                  subject = `Registration Accepted: ${eventData.name}`;
                  content = `Your registration for ${eventData.name} has been accepted.`;
                  statusColor = '#10b981'; // Green
                  statusMessage = 'accepted';
                  break;
                case 'rejected':
                  subject = `Registration Status Update: ${eventData.name}`;
                  content = `Your registration for ${eventData.name} has been rejected.`;
                  statusColor = '#ef4444'; // Red
                  statusMessage = 'rejected';
                  break;
                default:
                  subject = `Registration Status Update: ${eventData.name}`;
                  content = `Your registration for ${eventData.name} is now ${newRecord.status}.`;
                  statusColor = '#f59e0b'; // Yellow
                  statusMessage = newRecord.status;
              }
              
              // Create HTML content with better styling
              const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                  <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                    <h1 style="margin: 0;">Event Registration Update</h1>
                  </div>
                  <div style="padding: 20px; background-color: #f9fafb;">
                    <h2 style="color: #4f46e5;">Registration Status: <span style="color: ${statusColor};">${statusMessage.toUpperCase()}</span></h2>
                    <p>Hello <strong>${userDetails.full_name}</strong>,</p>
                    <p>Your registration for <strong>${eventData.name}</strong> has been <strong>${statusMessage}</strong>.</p>
                    
                    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${statusColor};">
                      <h3 style="margin-top: 0; color: #4f46e5;">Event Details</h3>
                      <p><strong>Event:</strong> ${eventData.name}</p>
                      <p><strong>Date & Time:</strong> ${formattedDate}</p>
                      <p><strong>Location:</strong> ${eventData.location}</p>
                      <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusMessage.toUpperCase()}</span></p>
                    </div>
                    
                    ${newRecord.status === 'accepted' ? `
                      <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #10b981;">
                        <h3 style="margin-top: 0; color: #10b981;">Next Steps</h3>
                        <p>Please save the date and make sure to arrive on time. If you have any questions, please contact the event organizer.</p>
                      </div>
                    ` : ''}
                    
                    <p>Thank you for your interest in our event!</p>
                  </div>
                  <div style="text-align: center; padding: 15px; color: #6b7280; font-size: 12px; border-top: 1px solid #e0e0e0;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                  </div>
                </div>
              `;
              
              // Send email
              await fetch('http://localhost:3000/send-direct', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: email,
                  subject,
                  content,
                  htmlContent
                }),
              });
              
              console.log(`Registration ${newRecord.status} email sent to`, userDetails.full_name);
            } catch (error) {
              console.error('Error handling event registration update:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
} 