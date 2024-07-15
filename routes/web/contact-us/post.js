const { ContactUs } = require('../../../services/all-models');
const { create, findOne } = require('../../utils/common-function');

/**
Create a new contact us details.
@param {*} req - The request object containing user details.
@param {*} res - The response object to send the success or failure response.
@returns The response with status code and message.
*/
module.exports.create = async (req, res) => {
    // let transaction;
    try {
         let userObj = Object.assign({}, req.body);
        // let checkEmail = await ContactUs.findOne({ where: { email: userObj.email, isActive: true }, raw: true });
        // if (checkEmail) return res.BadRequest({}, "Email id already exists!");
        userObj.createdBy =1;
        await create(ContactUs, userObj);
        
        return res.Ok({}, "Contact Us data has been created successfully!")
    } catch (err) {
        // if (transaction) await transaction.rollback();
        console.log("error:", err)
        return res.BadRequest({}, "Something went wrong!");
    }
}