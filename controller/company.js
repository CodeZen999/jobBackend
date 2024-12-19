const Joi = require('joi');
const Job = require("../model/job");
const Companies = require("../model/company");
const Application = require("../model/applications");

// Function to add a new job
const addCompany = async (req, res) => {
  // Joi schema for validation
  const schema = Joi.object({
    id: Joi.string().required(),
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    jobTitle: Joi.string().required(),
    // jobCategories: Joi.array().items(Joi.string()).required(),
    jobCategories: Joi.string().required(),
    jobType: Joi.string().valid("Full-Time", "Part-Time", "Contract", "Internship").required(),
    salary:Joi.number().integer().required(),
    jobLocation: Joi.string().required(),
    jobDuration: Joi.string().optional(),
    discription: Joi.string().required(),
    deadline: Joi.date().required(),
    positionsAvailable: Joi.number().integer().min(1).required(),
    maxApplicants: Joi.number().integer().min(1).required(),
    companyName: Joi.string().required(),
    // contactNumber: Joi.string().pattern(/^\+\d{1,3}\d{10}$/).required(),
    contactNumber: Joi.string().required(),
    companyLogo: Joi.string().uri().optional(),
    companyCover: Joi.string().uri().optional(),
    companyWebsite: Joi.string().uri().optional(),
    companyIndustry: Joi.string().required(),
    companySize: Joi.number().integer().min(1).optional(),
    companyDescription: Joi.string().optional(),
    companyPerks: Joi.string().optional(),
  });

  // Validate input data
  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Create job and company instances using validated data
    const job = new Job({
      posterId: value.id,
      fullName: value.fullName,
      email: value.email,
      jobTitle: value.jobTitle,
      jobCategories: value.jobCategories,
      salary: 5000,
      rating: '',
      jobType: value.jobType,
      jobLocation: value.jobLocation,
      jobDuration: value.jobDuration,
      discription: value.discription,
      deadline: value.deadline,
      positionsAvailable: value.positionsAvailable,
      maxApplicants: value.maxApplicants,
      companyLogo: value.companyLogo,
      companyCover: value.companyCover,
    });

    const company = new Company({
      userId: value.id,
      companyName: value.companyName,
      contactNumber: value.contactNumber,
      companyLogo: value.companyLogo,
      companyCover: value.companyCover,
      companyWebsite: value.companyWebsite,
      companyIndustry: value.companyIndustry,
      companySize: value.companySize,
      companyDescription: value.companyDescription,
      companyPerks: value.companyPerks,
    });

    // Save both job and company to the database
    await job.save();
    await company.save();

    // Send a single success response
    res.json({ message: "Your job has been posted successfully." });
  } catch (err) {
    // Send a single error response
    res.status(400).json({ error: err.message });
  }
};

// Function to get list job
const getCompanyList = async (req, res) => {
  let user = req.user;
  try {
    const allcompany = await Companies.find();

    res.status(200).json({allcompany});
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }

}

const getCompanyId = async (req, res) => {
  Job.findOne({ _id: req.params.id })
    .then((job) => {
      if (job == null) {
        res.status(400).json({
          message: "Job does not exist",
        });
        return;
      }
      res.json(job);
    })
    .catch((err) => {
      res.status(400).json({
        message: "Error fetching job",
        error: err.message, // Include the error message for debugging
      });
      1;
      console.log("error: ", err);
    });
};

const updateCompanyDetails = async (req, res) => {
  const user = req.user;

  // Check if the user is a recruiter
  if (user.type !== "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to change the job details",
    });
    return;
  }

  const jobId = req.params.id;
  const updateData = req.body;

  if (!updateData) {
    res.status(400).json({ message: "No data provided for update" });
    return;
  }

  try {
    // Find the job by ID and user ID, and update it
    const updatedJob = await Job.findByIdAndUpdate(
      {
        _id: jobId,
        userId: user.id,
      },
      updateData
      // { new: true, runValidators: true }
    );

    if (!updatedJob) {
      res.status(404).json({
        message: "Job does not exist",
      });
      return;
    }

    res.json({
      message: "Job details updated successfully",
      updatedJob,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const applyJob = async (req, res) => {
  const user = req.user;
  // console.log(req.body);
  // Check if the user is an applicant
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to apply for a job",
    });
    return;
  }

  Application.findOne({
    userId: user._id,
    status: {
      $nin: ["accepted", "finished"],
    },
  })
    .then((acceptedJob) => {
      if (
        (acceptedJob !== null && acceptedJob.status === "finished") ||
        (acceptedJob !== null && acceptedJob.status === "accepted")
      ) {
        res.status(400).json({
          message:
            "You already have an accepted job. Hence you cannot apply for a new one.",
        });
        return;
      }
      const data = req.body;
      const jobId = req.params.id;

      // Check if the user has already applied for the job
      Application.findOne({
        userId: user._id,
        jobId: jobId,
        status: {
          $nin: ["deleted", "cancelled"],
        },
      })
        .then((appliedApplication) => {
          // console.log(appliedApplication);
          if (
            appliedApplication !== null &&
            appliedApplication.status === "applied"
          ) {
            res.status(400).json({
              message: "You have already applied for this job",
            });
            return;
          }

          // Check if the job exists
          Job.findOne({ _id: jobId })
            .then((job) => {
              if (job === null) {
                res.status(404).json({
                  message: "Job does not exist",
                });
                return;
              }

              // Count the number active applications for the job
              Application.countDocuments({
                jobId: jobId,
                status: {
                  $nin: ["rejected", "deleted", "cancelled", "finished"],
                },
              })
                .then((activeApplicationCount) => {
                  // Check if the maxium number of appilcant for the job
                  if (activeApplicationCount < job.maxApplicants) {
                    // Count the number of active applications for the applicant
                    Application.countDocuments({
                      userId: user._id,
                      status: {
                        $nin: ["rejected", "deleted", "cancelled", "finished"],
                      },
                    })
                      .then((myActiveApplicationCount) => {
                        // Check if the applicant has not reached the maximum number of active applications
                        if (myActiveApplicationCount < 10) {
                          // Count the number of accepted jobs for the applicant
                          Application.countDocuments({
                            userId: user._id,
                            status: "accepted",
                          }).then((acceptedJobs) => {
                            // Check if the applicant has no accepted jobs
                            if (acceptedJobs === 0) {
                              // Create a new applicant instance
                              const application = new Application({
                                userId: user._id,
                                recruiterId: job.userId,
                                jobId: job._id,
                                status: "applied",
                                sop: data.sop,
                                ispayment : data.paystate,
                              });

                              // Save the applicant to the database
                              application
                                .save()
                                .then(() => {
                                  res.json({
                                    message: "Job application successful",
                                  });
                                })
                                .catch((err) => {
                                  res.status(400).json(err);
                                });
                            } else {
                              res.status(400).json({
                                message:
                                  "You already have an accepted job. Hence you cannot apply.",
                              });
                            }
                          });
                        } else {
                          res.status(400).json({
                            message:
                              "You have 10 active applications. Hence you cannot apply.",
                          });
                        }
                      })
                      .catch((err) => {
                        res.status(400).json(err);
                      });
                  } else {
                    res.status(400).json({
                      message: "Application limit reached",
                    });
                  }
                })
                .catch((err) => {
                  res.status(400).json(err);
                });
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      res.json(400).json(err);
    });
};

const checkApply = async (req, res) => {
  const user = req.user;

  if (user.type !== "applicant") {
    res.status(400).json({
      message: "You don't have permissions to check for an accepted job",
    });
    return;
  }

  try {
    const acceptedJob = await Application.findOne({
      userId: user._id,
      status: "accepted",
    });

    if (!acceptedJob) {
      const finishedJob = await Application.findOne({
        userId: user._id,
        status: "finished",
      });

      if (finishedJob) {
        res.json({
          hasAcceptedJob: true,
        });
        return;
      }
    }

    res.json({
      hasAcceptedJob: acceptedJob !== null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getApplications = async (req, res) => {
  const user = req.user;

  // Check if the user is a recruiter
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to view job applications",
    });
    return;
  }
  const jobId = req.params.id;
  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  // Define filtering parameters based on query parameters
  let findParams = {
    jobId: jobId,
    recruiterId: user._id,
  };

  let sortParams = {};

  // Filter applications based on status using 'status' query parameter
  if (req.query.status) {
    findParams = {
      ...findParams,
      status: req.query.status,
    };
  }

  // Retrieve applications from the database
  Application.find(findParams)
    .collation({ locale: "en" })
    .sort(sortParams)
    // .skip(skip)
    // .limit(limit)
    .then((applications) => {
      res.json(applications);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const deleteJob = async (req, res) => {
  const user = req.user;
  if (user.type !== "recruiter" && user.type !== "admin") {
    return res.status(401).json({
      message: "You don't have permissions to delete the job",
    });
  }

  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
    });
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }
    res.json({
      message: "Job deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
const getJobCategory = async(req, res) => {
  try {
    // Define the categories you want to filter
    const categoriesToFetch = ["development", "sales", "design", "marketing"];
    
    // Fetch jobs from the database
    const jobs = await Job.find({ category: { $in: categoriesToFetch } });

    res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching jobs.' });
  }
};

module.exports = {
  getCompanyList,
  applyJob,
  checkApply,
  getApplications,
  deleteJob,
  getJobCategory,
};
