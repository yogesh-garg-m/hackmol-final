const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Route to save event data as JSON file
router.post('/save-event', (req, res) => {
  try {
    const eventData = req.body;
    const eventId = eventData.event_id;

    if (!eventId) {
      return res.status(400).json({ error: 'event_id is required' });
    }

    // Use the existing events folder
    const outputDir = path.join(__dirname, '../events');
    
    // Check if the events folder exists, if not create it
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save the event data to a JSON file
    const filePath = path.join(outputDir, `${eventId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(eventData, null, 2), 'utf-8');

    res.status(200).json({ 
      success: true, 
      message: `Event data saved to ${filePath}`,
      file: filePath 
    });
  } catch (error) {
    console.error('Error saving event data:', error);
    res.status(500).json({ 
      error: 'Failed to save event data',
      details: error.message 
    });
  }
});

// Route to get event data by ID
router.get('/event/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      return res.status(400).json({ error: 'event_id is required' });
    }

    const filePath = path.join(__dirname, '../events', `${eventId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Event data not found' });
    }

    const eventData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.status(200).json(eventData);
  } catch (error) {
    console.error('Error retrieving event data:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve event data',
      details: error.message 
    });
  }
});

module.exports = router; 