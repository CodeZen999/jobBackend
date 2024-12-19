const passport = require("passport");
const jwt = require("jsonwebtoken");
const authKeys = require("../middleware/authKeys");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { OAuth2Client } = require('google-auth-library');

const User = require("../model/Users");
const Recruiter = require("../model/recruiter");
const JobApplicant = require("../model/jobApplicant");
const sendMail = require("../utils/sendMail");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Your Google Client ID


const generateOTP = () => {
  const min = 1000;
  const max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sendVerificationEmail = async (email, otp) => {
  try {
    // Gọi hàm sendEmail để gửi email với mã OTP
    const result = await sendEmail(email, otp); // Pass email and otp directly

    return result;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email");
  }
};


// Register 
const Register  =  async (req, res) => {
  const { userName, email, password, role } = req.body;

  // Basic validation
  if (!userName || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a new user
    const newUser = new User({
      userName,
      email,
      password,
      role
    });

    // Save the user to the database
    await newUser.save();

    // Create a JWT token (optional step)
    const accessToken = jwt.sign({ id: newUser._id }, authKeys.jwtSecretKey,{ expiresIn: '1h', issuer: 'minerva' });

    // Respond with the token and user info
    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendEmail = (recipient_email, OTP) => {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mail_configs = {
      from: process.env.MY_EMAIL,
      to: recipient_email,
      subject: "KODING 101 PASSWORD RECOVERY",
      html: `<!DOCTYPE html>
            <html lang="en" >
            <head>
              <meta charset="UTF-8">
              <title>CodePen - OTP Email Template</title>
              

            </head>
            <body>
            <!-- partial:index.partial.html -->
            <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
              <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Koding 101</a>
                </div>
                <p style="font-size:1.1em">Hi,</p>
                <p>Thank you for choosing Koding 101. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
                <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
                <p style="font-size:0.9em;">Regards,<br />Koding 101</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                  <p>Koding 101 Inc</p>
                  <p>1600 Amphitheatre Parkway</p>
                  <p>California</p>
                </div>
              </div>
            </div>
            <!-- partial -->
              
            </body>
            </html>`,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        // console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
};

const VerifyEmail = async (req, res) => {
  // console.log("Received OTP verification request");
  const { email, enteredOTP } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = generateOTP();

    await sendVerificationEmail(user.email, otp);

    // save the user to the database
    await user.save();

    if (
      Array.isArray(enteredOTP) &&
      user.otp !== undefined &&
      user.otp.trim() === enteredOTP.map((digit) => digit.trim()).join("")
    ) {
      // console.log("Stored OTP: ", user.otp.trim());
      user.otp = null;
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "OTP verify successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verify OTP: ", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Define a function for user Login
const Login = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(401).json(info);
        return;
      }
      // Token
      const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
      res.json({
        accessToken: token,
        user: user
      });
    }
  )(req, res, next);
};
// get user's personal details
const getUser = (req, res) => { 
  try {
    const user = req.user;
    if (user.role === "recruiter") {
      User.findOne({ _id: user._id })
        .then((recruiter) => {
          if (recruiter == null) {
            res.status(404).json({
              message: "User does not exist",
            });
            return;
          }
          res.json(recruiter);
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      User.findOne({ _id: user._id })
        .then((jobApplicant) => {
          if (jobApplicant == null) {
            res.status(404).json({
              message: "User does not exist",
            });
            return;
          }
          res.json(jobApplicant);
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// PUT: Update User Account
const update = async (req, res) => {
  const { id, avatar, location, gender, currency, phone, address } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's details
    user.avatar = avatar || user.avatar;  // Keep the existing avatar if none provided
    user.location = location;
    user.gender = gender;
    user.currency = currency;
    user.phone = phone;
    user.address = address;

    // Save updated user
    await user.save();
    res.status(200).json({ message: 'User data updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user data' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new Error("Missing Email");
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  const resetToken = user.createPasswordChangedToken();
  await user.save();
  const html = `
    <p style="font-family: Arial, Helvetica, sans-serif; font-weight: 500; font-size: 14px">
      Bạn nhận được email này vì bạn hoặc ai đó đã yêu cầu lấy lại mật khẩu
    </p>
    <p style="font-family: Arial, Helvetica, sans-serif; font-weight: 500; font-size: 14px">
      Chọn vào đây để lấy lại mật khẩu, yêu cầu này sẽ mất hiệu lực sau 15 phút:
    </p>
    <button style="padding: 14px; background-color: #1E90FF; border-radius: 5px; border-style: none; cursor: pointer">
      <a href=${process.env.CLIENT_URL}/password/reset/${resetToken}
        style="color:white; text-decoration-line: none; font-size: 14px; font-weight: 700">
          Reset Password
      </a>
    </button>
    <p style="font-family: Arial, Helvetica, sans-serif; font-weight: 500; font-size: 14px">Nếu bạn không yêu cầu đặt lại mật khẩu, 
    thì có thể bỏ qua email này</p>
    <p style="font-family: Arial, Helvetica, sans-serif; font-weight: 900; font-size: 14px">Cảm ơn bạn, </p>
    <p style="font-family: Arial, Helvetica, sans-serif; font-weight: 900; font-size: 14px">JobPortal Support Team!</p>
    <img src="https://res.cloudinary.com/dkmkutpxp/image/upload/v1703743129/a4qjcagbhc7juqqjlpir.jpg" style="width: 20rem" alt="thumbnail">
  `;

  const data = {
    email,
    html,
    subject: "[JobPortal] Password Reset E-Mail",
  };

  const result = await sendMail(data);
  return res.status(200).json({
    success: true,
    result,
  });
};

const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;
    if (!password || !token) {
      return res.status(400).json({ error: "Missing Input" });
    }

    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid Reset Token" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const googleLogin = async (req, res) => {
  const { token, type } = req.body; // Extract token and type from the request body

  if (type === 'applicant' || 'recruiter' || 'admin') {
    try {
      // Verify the Google token using Google's OAuth2Client
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      // The payload contains the user's Google account info
      const payload = ticket.getPayload();
      // console.log('Verified user info:', payload); // Log user's Google account info (email, name, etc.)

      // Extract data from the payload
      const { name, email, sub: userId, picture, exp } = payload;

      // Check if the user already exists in the database
      let user = await User.findOne({ email: email });

      if (user) {
        // If the user already exists, generate a JWT token and send it back
        const authToken = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
        return res.json({
          message: 'User already exists',
          token: authToken,
          type: user.type,
          _id: user._id,
        });
      }

      // If the user does not exist, create a new user
      user = new User({
        email: email,
        password: exp,  // Using the 'exp' value from payload as password, which might need a better approach (usually a hashed password)
        type: type,
      });

      // Save the user to the database
      await user.save();

      // Create user details based on user type (recruiter or job applicant)
      const userDetails =
        type === 'recruiter'
          ? new Recruiter({
            userId: user._id, // Use user._id instead of userId from the payload
            name: name,
            contactNumber: '',
            bio: ``,
            profile: picture,
          })
          : new JobApplicant({
            userId: user._id, // Use user._id here as well
            name: name,
            education: [],
            skills: [],
            rating: 0,
            resume: '',
            profile: picture,
          });

      // Save the user details (recruiter or job applicant)
      await userDetails.save();

      // Generate a JWT token
      const authToken = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);

      // Send the response back to the client (only once)
      res.status(200).json({
        message: "successfully saved",
        token: authToken,
        type: user.type,
        _id: user._id,
      });

    } catch (error) {
      console.error('Error verifying Google token:', error);

      // Handle errors and respond accordingly
      res.status(400).json({ message: 'Invalid token', error: error.message });
    }
  } else {
    // If the type is not "applicant", handle the case accordingly
    res.status(400).json({ message: 'Unsupported login type' });
  }
};
   




module.exports = {
  getUser,
  update,
  Login,
  Register, // new
  forgotPassword,
  resetPassword,
  sendEmail,
  VerifyEmail,
  googleLogin,
};
