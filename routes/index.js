const authRouter = require("./auth");
const userRouter = require("./user");
const jobRouter = require("./job");
const applicationRouter = require("./applications");
const ratingRouter = require("./rating"); 
const uploadRouter = require("./uploadImage");
const ResumeRouter = require("./uploadResume");
const downloadRouter = require("./download");
const companyRouter = require("./company");
const paymentRouter = require("./payment");

const initRouter = (app) => {
  app.use("/api/account", authRouter); //NEW
  app.use("/api/user", userRouter);
  app.use("/api/jobs", jobRouter);
  app.use("/api/company", companyRouter);
  app.use("/api/applications", applicationRouter);
  app.use("/api/uploadResume", ResumeRouter);
  app.use("/api/rating", ratingRouter);
  app.use("/api/upload", uploadRouter); //NEW
  app.use("/api/payment", paymentRouter);
  app.use("/api/download", downloadRouter);
};

module.exports = initRouter;        
