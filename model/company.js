const mongoose = require("mongoose");

let schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      default:"+911234567890",
    //   validate: {
    //     validator: function (v) {
    //       return v !== "" ? /\+\d{1,3}\d{10}/.test(v) : true;
    //     },
    //     msg: "Phone number is invalid!",
    //   },
    },

    companyLogo: {
      type: String,
    },
    companyCover: {
      type: String,
    },
    companyWebsite: {
      type: String,
    },
    companyIndustry: {
        type: String,
      },
      companySize: {
        type: Number,
      },
      companyDescription: {
        type: String,
      },
      companyPerks: {
        type: String,
      },
      isFeatured: {
        type: Boolean,
        default: false,
      },
      createdAt:{
        type: Date,
        default: Date.now(),
      }
  },
  { collation: { locale: "en" } }
);

module.exports = mongoose.model("Company", schema);
