require('rootpath')();
const express = require('express');
const apiRoutes = express.Router();
const auth = require('./authentication');
const ApiServices = require('../../services/ApiServices');

/****** Dashboard ******/
const dashboard = require('./dashboard');
apiRoutes.use(dashboard);

/****** Master ******/
const { publicRoutes } = require('../web/masters');
apiRoutes.use(ApiServices(publicRoutes));

/****** GEO ******/
const geo_master = require('./geo-masters');
apiRoutes.use(geo_master);

/****** Get Organisation data ******/
const organisation_details = require('./organisation-details');
apiRoutes.use("/organisation-details",organisation_details);

/****** USER ******/
const user = require('./user');
apiRoutes.use("/user", user);

/****** Session Captcha Api ******/
const captcha = require('./captcha');
apiRoutes.use(captcha);

/****** Contact Us ******/
const contact_us = require('./contact-us');
apiRoutes.use("/contact-us",contact_us);

/****** User Profile ******/
const user_profile = require('./user-profile');
apiRoutes.use("/user-profile",user_profile);

/****** S3 Upload ******/
const getS3Url = require("./s3/getS3Url");
apiRoutes.post("/getS3Url", getS3Url);

/****** LOGIN ******/
apiRoutes.post("/auth/login", auth.login.getUserInfo, auth.login.createToken);


/****** COMMON CRUD ******/
const commonServices = require('../../services/common');
apiRoutes.post("/create-update-delete", commonServices.bulkCreateOrUpdate);

/// Check Token
const verifyToken = require('beforeRoute/verify_token');
apiRoutes.use(verifyToken);

/****** LOGOUT ******/  
apiRoutes.post("/auth/logout", auth.logout);

/****** Favourite FPO ******/
const favourite_fpo = require('./favourite-fpo');
apiRoutes.use("/favourite-fpo",favourite_fpo);

/****** Director ******/
const director = require('./director');
apiRoutes.use("/director",director);

/****** Input-Output ******/
const inputOutput = require('./input-output');
apiRoutes.use("/input-output",inputOutput);

module.exports = apiRoutes;
