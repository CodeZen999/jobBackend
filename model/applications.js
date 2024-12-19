const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Job' 
  },
  applicationId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true, 
    ref: 'Proposer' 
  },
  posterId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true, 
    ref: 'Poster' 
  },
  jobtitle: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'Pending' // Pending, Shortlisted, Accepted, Rejected, etc.
  },
  email: { 
    type: String, 
    required: true 
  },
  experience: { 
    type: String, 
    required: true 
  },
  applicationAvatar:{
    type: String, 
    required: false 
  },
  location: { 
    type: Map, 
    of: String,
    required: true 
  },
  mobile: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  portfolioURL: { 
    type: String, 
    required: true 
  },
  salary: { 
    type: String, 
    required: true 
  },
  skills: [ 
    {
      title: String,
      year: Number
    }
  ],
  resume: { 
    type: String, 
    required: true 
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('Application', applicationSchema);
