require('dotenv').config();

const config = {
  apiKey: process.env.BREVO_API_KEY, // Brevo API key
  sender: {
    name: 'Team Nyquix',
    email: 'id.yogeshgarg@gmail.com', // Replace with your verified sender email
  },
  supabase: {
    url: process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key',
  },
};

if (!config.apiKey) {
  throw new Error('BREVO_API_KEY is not defined in .env file');
}
if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in .env file');
}

module.exports = config;