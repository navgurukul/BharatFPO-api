const express = require('express');
const CONFIG = require('config');
const apiRoutes = express.Router();
const get = require('./get');
const { update, create, resetPassword, forgotPassword, verifyEmail} = require('./post');
const verifyToken = require('../../../beforeRoute/verify_token');
const siteUrl= process.env.SITE_URL;
const passport = require('passport');
const passport_config = require('./passport_config');
const session = require('express-session')
const { LoginHistory } = require("../model");
const jwt = require('jsonwebtoken');
// const { findOne, findAndUpdate} = require('../../utils/common-function');
const getOrgData = require('../organisation-details/get');

//this is the route for get user.
apiRoutes.post("/create", create);
apiRoutes.post("/verify_email",verifyEmail);
apiRoutes.post("/forgot_password", forgotPassword);
apiRoutes.get("/get", verifyToken, get);
apiRoutes.put("/update", verifyToken, update);
apiRoutes.get("/get_all", verifyToken, get.getAll);
apiRoutes.post("/reset_password", resetPassword);
apiRoutes.get("/get_user_by_token",get.getUserByToken);
apiRoutes.get("/get", get,getOrgData);


// apiRoutes.post('/user/forgotpassword', forgotPassword); // api for user forgot password
// apiRoutes.post('/user/sendmail', sendEmail) // api for send email for forgot password

// routes for Google Auth

apiRoutes.use(
    session({
      secret: process.env.SUPERSECRET, // Replace with a secure secret key
      resave: false, // Set to false to prevent session resaving on each request
      saveUninitialized: true, // Set to true to save new sessions with uninitialized data
    })
  );
  for (const strategyName in passport_config) {
    const strategy = passport_config[strategyName];
    passport.use(strategy);
  }


apiRoutes.get("/auth/google",(req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: req.query.cin,
    })(req, res, next);
  });
  
apiRoutes.get("/auth/google/callback",
 passport.authenticate("google", {
    failureRedirect: `${siteUrl}/login`,
  }),
  async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(400).send("Authentication failed");
      }

    // At this point, req.user contains the authenticated user
    let user = req.user;
    try {

    // Create login history
    const loginHistory = {
      user_id: user.id,
      logged_in_at: new Date(),
      type: "web",
    };
  // Start transaction
    const t = await sequelize.transaction();
    const loginData = await LoginHistory.create(loginHistory, { transaction: t });
    user.loginId = loginData.id ;

      // Attempt to generate the JWT token
      const token = await new Promise((resolve, reject) => {
        jwt.sign(
          user.dataValues ? user.dataValues : user,
          CONFIG.superSecret,
          { expiresIn: "5h" },
          (err, token) => {
            if (err) {
              reject(err); // Token generation failed
            } else {
              resolve(token);
            }
          }
        );
      });

      // Update all other login history records for the user
      await LoginHistory.update({ logged_out_at: new Date() },
      {
          where: {
              user_id: user.id,
              type: "web",
              id: { $ne: loginData.id },
          },
          transaction: t,
      });
      await t.commit();
      res.redirect(`${siteUrl}/login?token=${token}`);
      // API will be called from this page .That API will provide user details. 
    } catch (error) {
      console.error("Error generating token:", error);
      return res.BadRequest({}, "Token generation failed");
    }

  }

);



apiRoutes.route("/auth/google/callback1").get(
    passport.authenticate("google", {
      failureRedirect: `${siteUrl}/login`,
    }),
    async (req, res) => {
      // Check if the user is authenticated
      console.log(req);

      if (!req.isAuthenticated()) {
        console.log('Auth failed------------');

        return res.status(400).send("Authentication failed");
      }
  
      // At this point, req.user contains the authenticated user
      let user = req.user;
      try {
        console.log('trying------------',  user.dataValues);

        // Attempt to generate the JWT token
        const token = await new Promise((resolve, reject) => {
          jwt.sign(
            user.dataValues ? user.dataValues : user,
            process.env.SUPERSECRET,
            { expiresIn: "5h" },
            (err, token) => {
              if (err) {
                console.log('token failed------------',err);
                reject(err); // Token generation failed
              } else {
                console.log('token created------------');
                resolve(token);
              }
            }
          );
        });
  
        // const loginHistoryData = await findOne(
        //     LoginHistory,
        //   getLoginHistory(user.uuid)
        // );
        // let obj = { user_id: user.uuid };
        // obj["logged_out_at"] = null;
        // const updateLoginHistory = loginHistoryData.user_id
        //   ? findAndUpdate(
        //       login_history,
        //       { where: { user_id: loginHistoryData.user_id } },
        //       obj
        //     )
        //   : create(login_history, obj);
        // await updateLoginHistory;
        res.redirect(`${siteUrl}/login?token=${token}`);
      } catch (error) {
        console.error("Error generating token:", error);
        return res.BadRequest({}, "Token generation failed");
      }
    }
  );
  function getLoginHistory(userId) {
    return {
      where: {
        user_id: userId,
      },
    };
  }

module.exports = apiRoutes;

