const CONFIG = require('config');
const moment = require('moment');
const { User, LoginHistory, Captcha, UserProfile } = require("../model");
const { findOne } = require('../../utils/common-function');
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");

/**
This function is used to retrieve user information from the database. It takes in the request object, response object, and next function as parameters.
@param {*} req - The request object containing the username and password used to retrieve the user information.
@param {*} res - The response object used to send success or error messages back to the client.
@param {*} next - The next function to be called in the middleware chain.
@returns The next function in the middleware chain, or a Bad Request error if there was an issue with the request.
*/
module.exports.getUserInfo = async function (req, res, next) {
    let { username, password, random, captcha_id, captchaText } = req.body;
    if (!username || !password) return res.BadRequest({}, 'Username and Password are mandatory!');
    if (!captcha_id || !captchaText) return res.BadRequest({}, 'Captcha should be mandatory!');

    try {
        let captcha_data = await findOne(Captcha, { where: { id: captcha_id } });
        if (!captcha_data) return res.BadRequest({}, 'Captcha not found');
        
        let { status, captcha_text } = captcha_data;
        if (!status) return res.BadRequest({}, 'Session expired!');
        if (captchaText !== captcha_text) return res.BadRequest({}, 'Incorrect Captcha');

        let uData = await findOne(User,{
            where: { 'email': username ,'google_auth':false, 'isActive':true},
            include: [{
                model: UserProfile,
                as: 'user_profile'
            }],
        });
        if (!uData) return res.BadRequest({}, 'Invalid credentials!');
        let data = JSON.parse(JSON.stringify(uData));
        req['data'] = data;
        // console.log(password);
        const hashedPassword = CryptoJS.SHA256(uData.password, random).toString();
        // console.log('DB pass-------------',uData.password);
        // console.log('DB pass after SHA-------------',hashedPassword);
        if (hashedPassword !== password) return res.BadRequest({}, 'Invalid credentials!');
        next();
    } catch (error) {
        console.log(error);
        return res.BadRequest({}, 'Something went wrong!');
    }
}

/**
This function creates a token for a user who has successfully logged in. It takes in the request object and response object as parameters.
@param {*} req - The request object containing user data and login history details.
@param {*} res - The response object used to send the token and login status back to the client.
@returns The response object containing the token and user data, or a Bad Request error if there was an issue with the request.
*/
module.exports.createToken = async function (req, res) {
    try {
        if (!req.data) return res.BadRequest({}, "Invalid credential");
        const rowData = req.data;
        const { lat, lng, ip_address } = req.body;
        const loginHistory = {
            user_id: rowData.id,
            lat,
            lng,
            logged_in_at: new Date(),
            type: "web",
        };
        // Start transaction
        const t = await sequelize.transaction();
        try {
            const data = await LoginHistory.create(loginHistory, { transaction: t });
            const tData = {
                id: rowData.id,
                email: rowData.email,
                mobile: rowData.mobile,
                name:rowData.name,
                // facility_name: rowData.facility_name,
                loginId: data.id,
                role_id: rowData.role_id,
                // ip_address,
            };
            const token = jwt.sign(tData, CONFIG.superSecret, {});
            // Update all other login history records for the user
            await LoginHistory.update({ logged_out_at: new Date() },
                {
                    where: {
                        user_id: rowData.id,
                        type: "web",
                        id: { $ne: data.id },
                        logged_out_at: null
                    },
                    transaction: t,
                });
                

            let objData = {
                id: rowData.id,
                role_id: rowData.role_id,
                email: rowData.email,
                name:rowData.name,
                profile_img: rowData.profile_img,
                cin_no:rowData["user_profile.cin"],
                fpo_id:rowData['user_profile.id'], // user-profile id
                mobile: rowData.mobile ? rowData.mobile : null,
                created_at: rowData.created_at,
            }
            // if (!['ADMIN'].includes(rowData.role.name)) {
            //     objData['isPasswordChange'] = rowData.is_password_change;
            //     objData['isPaymentComplete'] = rowData.is_payment;
            //     objData['isProfileUpdated'] = rowData.is_profile_updated;
            // }
            // Commit transaction
            await t.commit();
            return res.status(200).send({
                timestamp: moment().unix(),
                success: true,
                message: "Logged in successfully...",
                token,
                data: objData
            });
        } catch (error) {
            // Rollback transaction on error
            await t.rollback();
            throw error;
        }
    } catch (error) {
        console.log("error while login", error)
        return res.BadRequest({}, "Invalid credential");
    }
};
