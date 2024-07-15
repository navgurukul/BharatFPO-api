const { create} = require('../../utils/common-function');
const db = require("../../../dbConnection");

/**
Create a new contact us details.
@param {*} req - The request object containing user details.
@param {*} res - The response object to send the success or failure response.
@returns The response with status code and message.
*/
module.exports.create = async (req, res) => {

    let master_type = req.params.master_type;
    const new_value = req.body.name;
    const model = db[master_type];
  try {
    
    let check_existence = await model.findOne({
      where: { name: new_value, isActive: true },
      raw: true
      });  
    if(check_existence) return res.BadRequest({}, "Value already exists");

    req.body.createdBy = 1;
    const result = await create(model, req.body);

    return res.Ok(result, "Value saved successfully!");
  } catch (error) {
    console.log(error);
    return res.BadRequest({}, "Something went wrong!");

  }
}

