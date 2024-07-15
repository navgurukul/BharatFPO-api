const {
  User,
  OTP,
  UserProfile,
  Director,
} = require("../../../services/all-models");
const {
  create,
  getDate,
  findOne,
  findAndUpdate,
  bulkCreate,
  getIdForlist
} = require("../../utils/common-function");
const { Op } = require("sequelize");
const CryptoJS = require("crypto-js");
const sendEmail = require("../../utils/sendEmail");
const getOrgData = require("../organisation-details/get");
const { transformAuthInfo } = require("passport");
const{createFPO} = require("../user-profile/post");

/**
Create a new facility user with a randomly generated password and send an email with login credentials.
@param {*} req - The request object containing user details.
@param {*} res - The response object to send the success or failure response.
@returns The response with status code and message.
*/
module.exports.create = async (req, res, next) => {
  try {
    const constVar = global._const;
    let userObj = Object.assign({}, req.body);
    userObj.role_id = constVar.ROLE.ADMIN;
    
    // Check if the user already existes.
    let checkEmail = await User.findOne({
      where: { email: userObj.email, isActive: true },
      raw: true,
    });
    if (checkEmail) return res.BadRequest({}, "Email id already exists!");

    // Check if the user's FPO exists that is already mapped to another user.
    let checkFPO = await UserProfile.findOne({
      where: {
        cin: userObj.cin_no,
        isActive: true,
        user_id: { [Op.not]: null },
      },
      raw: true,
    });
    if (checkFPO)
      return res.BadRequest({}, "User already exists for this FPO!");

    // Create the User
    let transaction = await sequelize.transaction();
    try {
      let ur = await create(User, userObj,{transaction});
      // Map the user with the FPO profile.
      // map user if FPO exists else create FPO and then mapp the user.
      const result = await UserProfile.findOne({
        where: { cin: userObj.cin_no, isActive: true },
        raw: true,
      });
      if (result) {
        // map the user with the FPO
        findAndUpdate(
          UserProfile,
          { where: { cin: userObj.cin_no, isActive: true, user_id: null } },
          { user_id: ur.id }
        );
        } else{
          await createFPO(req,res,userObj,ur,transaction)
        }
        transaction.commit();
        // Send Registration Email to User.
        const payload = {
            email: userObj.email,
            name: userObj.name
        };
        await sendEmail("register", payload)
        return res.Ok({}, "User has been created successfully!");
    } catch (err) {
      if (transaction) await transaction.rollback();
      console.log("error on Creating user or updating FPO-----", err);
    }
  } catch (err) {
    console.log("error:", err);
    return res.BadRequest({}, "Something went wrong!");
  }
};

/* This is a function that is used to update the user's data. */
module.exports.update = async (req, res) => {
  let t = await sequelize.transaction();
  try {
    let { id } = req.user;
    let { email, finalSubmit } = req.body;
    if (!email) return res.BadRequest({}, "Email is required in the body!");
    const condition = { email, is_deleted: false };
    const result = await User.findOne({ where: condition, raw: true });
    if (!result) return res.BadRequest({}, "User does not exists!");
    const obj = req.body;
    obj["is_draft"] = true;
    if (req.body && finalSubmit) {
      obj["is_profile_updated"] = true;
      obj["profile_submitted_at"] = getDate(new Date());
      obj["is_draft"] = false;
    }
    obj["updated_at"] = Date.now();
    obj["updated_by"] = id;
    const [numRows, updatedRows] = await User.update(obj, {
      where: condition,
      returning: true,
    });
    if (numRows === 0)
      return res.BadRequest({}, "Error while getting data for update!");
    t.commit();
    return res.Ok(updatedRows, "Update Successfully");
  } catch (error) {
    console.log("error:", error);
    t.rollback();
    return res.BadRequest({}, "Something went wrong!");
  }
};
/* The above code is generating a random OTP and sending it to the user's email address. */
module.exports.sendOtp = async (req, res) => {
  try {
    sequelize.transaction().then(async (t) => {
      req.body["type"] = global._const.templateType.update;
      const createOtp = await createNewOtp(
        req.body.emailId,
        req.body.contactNo.countryCode,
        req.body.contactNo.number,
        req.body.type,
        { transaction: t }
      );
      if (!createOtp) {
        return res.BadRequest({}, "Unable to generate OTP!");
      } else {
        let otpObj = {
          to: createOtp.emailId,
          otp: createOtp.otp,
          type: req.body.type,
        };
        const sendotp = await sendEmail(otpObj);
        if (sendotp.status) {
          t.commit();
          let resData = { otpTxnId: createOtp.txnId, otp: createOtp.otp };
          return res.Ok(resData, "OTP SENT SUCCESSFULLY.");
        } else {
          t.rollback();
          return res.BadRequest(
            sendotp.error,
            "ERROR WHILE SENDING EMAIL.",
            401
          );
        }
      }
    });
  } catch (error) {
    return res.BadRequest(error, "ERROR WHILE SENDING EMAIL.", 401);
  }
};
/**
Updates the user's password with the provided new password after verifying the old password.
@param {*} req - The request object containing the old and new password.
@param {*} res - The response object that returns the success or failure message.
@returns - Returns the success or failure message as the response.
*/
module.exports.resetPassword = async (req, res) => {
  try {
    let { oldPassword, newPassword } = req.body;
    if (!oldPassword) return res.BadRequest({}, "Old password is missing");
    if (!newPassword) return res.BadRequest({}, "New password is missing");
    let checkOldPass = await User.findOne({
      where: { password: oldPassword },
      raw: true,
    });
    if (!checkOldPass) return res.BadRequest({}, "Old password is incorrect");
    if (newPassword.toString() == oldPassword.toString())
      return res.BadRequest({}, "New password and Old password can't be same");
    let updateObj = {
      is_password_change: true,
      password: newPassword,
    };
    await User.update(updateObj, {
      where: { password: oldPassword },
      raw: true,
    });
    return res.Ok({}, "Your password has been updated successfully!");
  } catch (error) {
    console.log("error", error);
    return res.BadRequest({}, "Something went wrong!");
  }
};
/**
Controller function for handling forgot password functionality.
@param {*} req - Express request object.
@param {*} res - Express response object.
@returns - Returns an HTTP response indicating success or failure of the password reset operation.
*/
module.exports.forgotPassword = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email) return res.BadRequest({}, "Email id is required!");
    if (!password) return res.BadRequest({}, "Password is required!"); //New password

    // const findOtpData = await OTP.findOne({ where: { email, txn_id: otpTxnId } });
    // if (!findOtpData) return res.BadRequest({}, "Please enter correct OTP txn id!")
    result = await findAndUpdate(
      User,
      {
        where: { email, isActive: true },
      },
      { password: password }
    );

    console.log("------------", result, "---------------");
    return res.Ok({}, "Your password has been set successfully!");
  } catch (error) {
    console.log("error", error);
    return res.BadRequest({ error }, "Something went wrong!");
  }
};

/**
Controller function for checking user existence for forgot password functionality.
@param {*} req - Express request object.
@param {*} res - Express response object.
@returns - Returns an HTTP response indicating success or failure of the email/user verification.
*/
module.exports.verifyEmail = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.BadRequest({}, "Email id is required!");
    let user = await findOne(User, { where: { email: email, isActive: true } });
    if (Object.keys(user).length) {
      return res.Ok({}, "User verified successfully!");
    } else {
      return res.BadRequest({}, "User not found. Please try again");
    }
  } catch (error) {
    console.log("error", error);
    return res.BadRequest({}, "Something went wrong!");
  }
};

module.exports.mapFacilityWithCse = async (req, res) => {
  const { cse_id, facility_id } = req.body;
  if (!cse_id) return res.BadRequest({}, "Cse Id is missing from body!");
  let updateData = { is_mapped: true };

  if (!facility_id.length) updateData["is_mapped"] = false;

  const transaction = await sequelize.transaction();
  try {
    await Promise.all([
      User.update({ cse_id: null }, { where: { cse_id }, transaction }),
      User.update({ cse_id }, { where: { id: facility_id }, transaction }),
      Cse.update(updateData, { where: { id: cse_id }, transaction }),
    ]);

    await transaction.commit();
    return res.Ok({}, "Data mapped successfully!");
  } catch (error) {
    await transaction.rollback();
    console.log("error", error);
    return res.BadRequest({}, "Something went wrong!");
  }
};
module.exports.mapCseFacility = async (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : null;
  let offset = req.query.page ? parseInt((req.query.page - 1) * 10) : 0;
  let total = 0;
  let { cse_id } = req.params;
  let whereCondition = { cse_id, is_deleted: false };
  if (req.query.facility_name) {
    whereCondition["facility_name"] = {
      [Op.iLike]: `%${req.query.facility_name}%`,
    };
  }
  try {
    if (!offset) {
      total = await User.findAll({
        where: whereCondition,
        attributes: ["id", "facility_name"],
        include: [
          {
            model: Cse,
            as: "cse",
            attributes: ["id", "name"],
            required: true,
          },
        ],
        nested: true,
      });
    }
    let getUser = await User.findAll({
      where: whereCondition,
      attributes: ["id", "facility_name"],
      include: [
        {
          model: Cse,
          as: "cse",
          attributes: ["id", "name"],
          required: true,
        },
      ],
      nested: true,
      limit,
      offset,
    });
    if (limit === null) return res.Ok(getUser, "Data fetched successfully!");

    return res.Ok(getUser, "User get successfully!", total.length);
  } catch (error) {
    console.log("error", error);
    return res.BadRequest({}, "Something went wrong!");
  }
};
