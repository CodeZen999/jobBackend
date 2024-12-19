const mongoose = require("mongoose");

// Define the schema for the job posting model
let schema = new mongoose.Schema(
  {
    posterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    fullName: {
      type: String,
      required: true, 
    },
    email: {
      type: String,
      required: true, 
      match: [ 
        /^\S+@\S+\.\S+$/, 
        'Please enter a valid email address'
      ],
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobCategories: {
      type: String,
      required: true,
    },
    maxApplicants: {
      type: Number,
      validate: [
        {
          validator: Number.isInteger,
          msg: "maxApplicants should be an integer",
        },
        {
          validator: function (value) {
            return value > 0;
          },
          msg: "maxApplicants should be greater than 0",
        },
      ],
      required: true, 
    },
    positionsAvailable: {
      type: Number,
      validate: [
        {
          validator: Number.isInteger,
          msg: "positionsAvailable should be an integer",
        },
        {
          validator: function (value) {
            return value > 0;
          },
          msg: "positionsAvailable should be greater than 0",
        },
      ],
      required: true, 
    },
    activeApplications: {
      type: Number,
      default: 0,
      validate: [
        {
          validator: Number.isInteger,
          msg: "activeApplications should be an integer",
        },
        {
          validator: function (value) {
            return value >= 0;
          },
          msg: "activeApplications should be greater than or equal to 0",
        },
      ],
    },
    acceptedCandidates: {
      type: Number,
      default: 0,
      validate: [
        {
          validator: Number.isInteger,
          msg: "acceptedCandidates should be an integer",
        },
        {
          validator: function (value) {
            return value >= 0;
          },
          msg: "acceptedCandidates should be greater than or equal to 0",
        },
      ],
    },
    dateOfPosting: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      validate: [
        {
          validator: function (value) {
            return this.dateOfPosting < value; 
          },
          msg: "Deadline should be greater than dateOfPosting",
        },
      ],
      required: true,
    },
    skillsets: {
      type: [String],
      default: [],
    },
    jobType: {
      type: String,
      required: true, 
    },
    jobDuration: {
      type: Number,
      min: 0,
      validate: [
        {
          validator: Number.isInteger,
          msg: "Duration should be an integer",
        },
      ],
      required: true, 
    },
    salary: {
      type: Number,
      validate: [
        {
          validator: Number.isInteger,
          msg: "Salary should be an integer",
        },
        {
          validator: function (value) {
            return value >= 0;
          },
          msg: "Salary should be positive",
        },
      ],
      required: true,
    },
    jobLocation: {
      type: String,
      required: true, 
    },
    rating: {
      type: Number,
      max: 5.0,
      default: 0, 
      // validate: {
      //   validator: function (v) {
      //     return v >= -1.0 && v <= 5.0; // Rating should be between -1 and 5
      //   },
      //   msg: "Invalid rating",
      // },
    },
    discription: {
      type: String,
      required: true, 
    },
    companyLogo: {
      type: String,
      required: true, 
    },
    companyCover: {
      type: String,
      required: true, 
    },

  },
  {
    collation: { locale: "en" }, 
    timestamps: true, 
  }
);

module.exports = mongoose.model("Job", schema);
