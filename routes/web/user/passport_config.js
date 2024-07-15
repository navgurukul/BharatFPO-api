// passport-config.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User,UserProfile } = require("../model");
const {
  findOne,
  create,
  findAndUpdate
} = require("../../utils/common-function");

passport.use(
  "google", // Set a name for the strategy
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      let where = {
        email: profile.emails[0].value,
      };          
        findOne(User, { where }).then((existingUser) => {
            if (Object.keys(existingUser).length) {
              let tData = {
                id: existingUser.id,
                email: existingUser.email,
                mobile: existingUser.mobile,
                name:existingUser.name,
                // facility_name: rowData.facility_name,
                // loginId: data.id,
                role_id: existingUser.role_id,
                // ip_address,
            };
          return done(null,tData);
        } else {
          let newUser = {
            name: profile.displayName ? profile.displayName : "",
            email: profile.emails[0].value,
            google_auth: true,
            createdBy: 1
            // role_id: roleId.uuid,
            // user_type: userRole,
            // email_verify_status: true,
          };
          create(User, newUser)
          .then(async (user) => {
            let tData = {
              id: user.id,
              email: user.email,
              mobile: user.mobile,
              name:user.name,
              // facility_name: rowData.facility_name,
              // loginId: data.id,
              role_id: user.role_id,
              // ip_address,
          };
          // update fpo profile with user_id mapping
          try{
            await findAndUpdate(
                UserProfile,
                { where: { cin : request.query.state, isActive: true , user_id:null} },
                {user_id:user.id}
              );
              
            }catch(err){
                console.log('error on updating FPO-----',err)
            }

              return done(null, tData);
            })
            .catch((e) => {
              console.log(e);
            });
        }
      });
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await findOne(user, { id });
  done(null, user);
});
