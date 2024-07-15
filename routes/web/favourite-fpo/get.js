const { findAll } = require("../../utils/common-function");
const { FavouriteFpo, UserProfile,Block,District,State } = require("../model");

module.exports = async (req, res) => {
    let {user_id} = req.query;
    if (!user_id) return res.BadRequest({}, 'User id is mandatory!');
    let {type} = req.query;
    let { limit } = req.query;
    let { offset } = req.query;
    console.log(limit);
    console.log(offset);
    let where = { user_id, isActive: true };
    if(type)
    where = { ...where, type};

    try {
        let visited_fav_data = await findAll(FavouriteFpo,{
            where,
            order: [["id", "DESC"]],
            include: [
              {
                model: UserProfile,
                as: "user_profile",
                include: [
                {
                  model: Block,
                  as: "block",
                  attributes: ["name","id"],
                  include: [
                    {
                      model: District,
                      as: "district",
                      attributes: ["name","id"],
                      include: [
                        {
                          model: State,
                          as: "state",
                          attributes: ["name","id"],
                        },
                      ],
                    },
                  ],
                }
              ]
              }
            ], 
            limit,
            offset,
            order: [["id", "DESC"]],
            subQuery:false,
            raw:false
            }
        );

        return res.Ok(visited_fav_data, "Data fetched successfully!");
    } catch (error) {
      console.log(error);
      return res.BadRequest({}, 'Something went wrong!');
    }
  };

  module.exports.getAllByType = async (req, res) => {
    let {user_id} = req.query;
    let {type} = req.query;
    if (!user_id) return res.BadRequest({}, 'User id is mandatory!');
    if (!type) return res.BadRequest({}, 'Type is mandatory!');
    try {
        let visited_fav_data = await findAll(FavouriteFpo,{
            where:{type,isActive:true}
            }
        );
        return res.Ok(visited_fav_data, "Data fetched successfully!");
    } catch (error) {
      console.log(error);
      return res.BadRequest({}, 'Something went wrong!');
    }
}
  