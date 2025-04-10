const express = require('express');
const router = express.Router();
const { sendEmail, fetchUserEmail, sendDirectEmail } = require('../utils/email');

router.post('/send-connection-email', async (req, res) => {
  const { user2_id, user2_full_name, user1_id } = req.body;

  // Validate required fields
  if (!user1_id || !user2_full_name || !user2_id) {
    return res.status(400).json({ error: 'Missing required fields: user1_id, user1_full_name, user2_id' });
  }

  try {
    const content = `
      <p>Hi,</p>
      <p>${user2_full_name} has accepted your connection request!</p>
    `;
    await sendEmail({
      toUserId: user1_id, // Send to user2
      subject: 'Connection Request Accepted',
      content,
    });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Route to send email to a user by ID
router.post('/send', async (req, res) => {
  try {
    const { toUserId, subject, content } = req.body;
    
    if (!toUserId || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const email = await fetchUserEmail(toUserId);
    await sendEmail(email, subject, content);
    
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Route to send email directly without user ID lookup
router.post('/send-direct', async (req, res) => {
  try {
    const { to, subject, content, htmlContent } = req.body;
    
    if (!to || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    console.log('***************************************to********************************************', to);
    await sendDirectEmail({to : to, subject: subject, content: content, htmlContent: htmlContent});
    
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending direct email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Route to get user email by ID
router.get('/get-user-email/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const email = await fetchUserEmail(userId);
    res.status(200).json({ email });
  } catch (error) {
    console.error('Error fetching user email:', error);
    res.status(500).json({ error: 'Failed to fetch user email' });
  }
});

module.exports = router;