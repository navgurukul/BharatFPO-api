const { User, Director } = require('../../../services/all-models');
const { create, getDate } = require('../../utils/common-function');
const { Op } = require('sequelize');
// const user_profile = require('../../../models/user_profile');
const userObj = require('../../../models/user');
// const user_profile = require('../../../models/user_profile');

/**
Create user's proifle.
@param {*} req - The request object containing user details.
@param {*} res - The response object to send the success or failure response.
@returns The response with status code and message.
*/
module.exports.create = async (req, res) => {
    let transaction;
    try {
        let directorObj = Object.assign({}, req.body);
        directorObj.createdBy = req.user.id;

        let checkDIN = await Director.findOne({ where: { din: directorObj.din, isActive: true }, raw: true });
        if (checkDIN) return res.BadRequest({}, "Diector with this DIN already exists!")
        const DirectorData = await create(Director, directorObj);
    
        return res.Ok({DirectorData}, "Director Profile has been created successfully!")
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.log("error:", err)
        return res.BadRequest({}, "Something went wrong!");
    }
}
/* This is a function that is used to update the User's Profiledata. */
module.exports.update = async (req, res) => {
    let t = await sequelize.transaction();
    try {
        let { id } = req.user;
        let { din } = req.body
        if (!din) return res.BadRequest({}, "din is required in the body!")
        const condition = { din, isActive: true };
        const obj = req.body;
        obj['updated_at'] = Date.now();
        obj['updated_by'] = id;
        const [numRows, updatedRows] = await Director.update(obj, { where: condition, returning: true });
        if (numRows === 0) return res.BadRequest({}, 'Error while getting data for update!');
        return res.Ok(updatedRows, "Update Successfully");
    } catch (error) {
        console.log("error:", error);
        return res.BadRequest({}, "Something went wrong!");
    }
};

