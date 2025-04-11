const SibApiV3Sdk = require('sib-api-v3-sdk');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

// Initialize Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = config.apiKey;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Initialize Supabase Admin client
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey);

// Function to fetch email from auth.users
async function fetchUserEmail(userId) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) throw error;
    return data.user.email;
  } catch (error) {
    console.error('Error fetching user email:', error.message);
    throw error;
  }
}

// Function to send email
async function sendEmail({ toUserId, subject, content }) {
  try {
    // Fetch recipient email from auth.users
    const toEmail = await fetchUserEmail(toUserId);

    // HTML template with red background and branding
    const htmlContent = `
      <div style="background-color: #ff0000; padding: 20px; color: white; text-align: center;">
        <h2>Campus SETU</h2>
      </div>
      <div style="padding: 20px;">
        ${content}
      </div>
    `;
    
    // Create the email object
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = config.sender;
    sendSmtpEmail.to = [{ email: toEmail }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    // Send the email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully to', toEmail, ':', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Function to send email directly without user ID lookup
async function sendDirectEmail({ to, subject, content, htmlContent }) {
  try {
    // Create the email object
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    console.log('***************************************to in function********************************************', to);
    // Set sender from config
    sendSmtpEmail.sender = config.sender;
    
    // Set recipient
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    
    // Use provided HTML content or wrap plain content in our template
    sendSmtpEmail.htmlContent = htmlContent || `
      <div style="background-color: #ff0000; padding: 20px; color: white; text-align: center;">
        <h2>Campus SETU</h2>
      </div>
      <div style="padding: 20px;">
        ${content}
      </div>
    `;

    // Send the email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Direct email sent successfully to', to, ':', response);
    return response;
  } catch (error) {
    console.error('Error sending direct email:', error);
    throw error;
  }
}

module.exports = { sendEmail, fetchUserEmail, sendDirectEmail };