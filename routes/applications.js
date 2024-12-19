const express = require("express");
const Application = require('../model/applications'); // Mongoose model
// Middleware xác thực JWT (JSON Web Token)
const jwtAuth = require("../middleware/jwtAuth");

// Create a router object from Express
const router = express.Router();

// Submit a new application
router.post('/', async (req, res) => {

  try {
    const { jobId, applicationId, posterId, jobtitle} = req.body;

    // Check if already applied
    const existingApplication = await Application.findOne({ jobId, applicationId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // Create a new application
    const newApplication = new Application({
      jobId,
      applicationId,
      posterId,
      jobtitle,
      status: 'Pending', // Default status
      ...req.body,
    });

    const savedApplication = await newApplication.save();
    res.status(201).json(savedApplication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get applications
router.get('/', async (req, res) => {
    try {
      const filters = {};
      if (req.query.jobId) filters.jobId = req.query.jobId;
      if (req.query.applicationId) filters.applicationId = req.query.applicationId;
      if (req.query.status) filters.status = req.query.status;
  
      const applications = await Application.find(filters);
      res.status(200).json(applications);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Update application status
router.patch('/:id', async (req, res) => {
    try {
      const { status } = req.body;
  
      // Validate the status
      const allowedStatuses = ['Pending', 'Shortlisted', 'Accepted', 'Rejected', 'Finished', 'Canceled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
  
      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true } // Return the updated document
      );
  
      if (!application) {
        return res.status(404).json({ message: 'Application not found.' });
      }
  
      res.status(200).json(application);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Delete application
router.delete('/:id', async (req, res) => {
    try {
      const application = await Application.findByIdAndDelete(req.params.id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found.' });
      }
      res.status(200).json({ message: 'Application deleted successfully.' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

module.exports = router;