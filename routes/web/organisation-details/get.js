// const Models = require('../../../dbConnection');
// const { Op } = require('sequelize');
// const { Readable } = require('stream');
// const { profilePercentage, getOptionValue, changeFields } = require('../../utils/common-function');
// const { UserProfile } = require('../model');
// const { ROLE } = require('../../utils/constant');
const axios = require("axios");

module.exports = async (req, res) => {
  try {
    // let { cin } = req.body ? req.body : req.query;
    if(req.query.cin){
      cin = req.query.cin
    }else{
      cin = req.body.cin
    }
    if (!cin) return res.BadRequest({}, "CIN  is required in params!");
    // Generate token for Get company details API
    const token = await sandbox_auth();
    const data = await oragnization_data(token, cin);
    let result = JSON.parse(data);
    if (req["orgData"]) {
      let resultOrgData = { ...req["orgData"] };
      // console.log("-----------------if req org data present", result.code);
      if (result.code == 200) {
        // console.log("----------if CIN found");
        resultOrgData["directors_details"] =
          result.data["directors/signatory_details"];
      }
      return req.returnStatus
        ? resultOrgData
        : res.Ok(resultOrgData, "Fetched data successfully!");
    } else {
      return req.returnStatus
        ? result
        : res.Ok(result, "Fetched data successfully!");
    }
    // Get organization information from CIN using Sandbox API
  } catch (error) {
    console.log("error:", error);
    res.BadRequest({}, "Something went wrong!");
  }
};

// Generate token for sandbox
const sandbox_auth = async () => {
  try {
    let config = {
      method: "post",
      url: process.env.SANDBOXURL,
      headers: {
        "x-api-key": process.env.SANDBOXKEY,
        "x-api-secret": process.env.SANDBOXSECRET,
        "x-api-version": process.env.SANDBOXVERSION,
      },
    };
    const response = await axios.request(config);
    // console.log(JSON.stringify(response.data));
    const token = response.data.access_token || "";
    return token;
  } catch (error) {
    console.log(error);
  }
};

// Get organization data from sandbox API
const oragnization_data = async (token, cin) => {
  var org_data;
  var myHeaders = new Headers();
  myHeaders.append("Authorization", token);
  myHeaders.append("x-api-key", process.env.SANDBOXKEY);
  myHeaders.append("x-api-version", process.env.SANDBOXVERSION);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  await fetch(
    "https://api.sandbox.co.in/mca/companies/" +
      cin +
      "?consent=y&reason=For Company KYC&=",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      org_data = result;
    })
    .catch((error) => console.log("error", error));

  return org_data;
};
