const { findOne, findAll } = require("../../utils/common-function");
const { ContactUs } = require("../model");

module.exports = async (req, res) => {
    let {id} = req.query;
    if (!id) return res.BadRequest({}, 'Contact Us id is mandatory!');
    try {
        let conatct_us_data = await findOne(ContactUs,{
            where:{id,isActive:true}
            }
        );

        return res.Ok(conatct_us_data, "Data fetched successfully!");
    } catch (error) {
      console.log(error);
      return res.BadRequest({}, 'Something went wrong!');
    }
  };

  module.exports.getAll = async (req, res) => {
    try {
        let conatct_us_data = await findAll(ContactUs,{
            where:{isActive:true}
            }
        );
        return res.Ok(conatct_us_data, "Data fetched successfully!");
    } catch (error) {
      console.log(error);
      return res.BadRequest({}, 'Something went wrong!');
    }
}
  