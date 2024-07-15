const {FpoInputOutput} = require('../../../services/all-models');
const { bulkCreate} = require('../../utils/common-function');

/**
Create user's proifle.
@param {*} req - The request object containing user details.
@param {*} res - The response object to send the success or failure response.
@returns The response with status code and message.
*/
module.exports.create = async (req, res) => {
    let transaction;
    try {

        const array_data = req.body;
        array_data.forEach(ele => {
            ele.createdBy = req.user.id
        });
        const data_res= await bulkCreate(FpoInputOutput, array_data,{transaction});
        return res.Ok({data_res}, "Input/Output data has been created successfully!")
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.log("error:", err)
        return res.BadRequest({}, "Something went wrong!");
    }
}


