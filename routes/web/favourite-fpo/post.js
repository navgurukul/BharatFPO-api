const { FavouriteFpo } = require('../../../services/all-models');
const { create, findOne, findAndUpdate } = require('../../utils/common-function');

/**
Create a new contact us details.
@param {*} req - The request object containing user details.
@param {*} res - The response object to send the success or failure response.
@returns The response with status code and message.
*/
module.exports.create = async (req, res) => {
    // let transaction;
    try {
         let favObj = Object.assign({}, req.body);
         favObj.createdBy = favObj.user_id;
         // if visited is already added then ignore
         if(favObj.type==1){
             let checkdata = await FavouriteFpo.findOne({ where: { user_id: favObj.user_id,type: favObj.type, fpo_id: favObj.fpo_id, isActive: true }, raw: true });
             if (checkdata) {
                return res.Ok({}, "Already added to visited");
             }else{
                await create(FavouriteFpo, favObj);
                return res.Ok({}, "Added to saved/Favourites")
             }
         }else{
            // if saved or added to favourite is already added.
            let checkdata = await FavouriteFpo.findOne({ where: { user_id: favObj.user_id,type: favObj.type, fpo_id: favObj.fpo_id }, raw: true });
             if (checkdata) {
                // if data exists update the isActive status.
                await findAndUpdate(FavouriteFpo,{ where: { user_id: favObj.user_id,type: favObj.type, fpo_id: favObj.fpo_id }},{isActive:true})
                return res.Ok({}, "Added to saved/Favourites");

             }else{
                await create(FavouriteFpo, favObj);
                return res.Ok({}, "Added to saved/Favourites")
             }
         }
    } catch (err) {
        // if (transaction) await transaction.rollback();
        console.log("error:", err)
        return res.BadRequest({}, "Something went wrong!");
    }
}

module.exports.update = async (req, res) => {
   // let transaction;
   try {
        let favObj = Object.assign({}, req.body);
        favObj.createdBy = favObj.user_id;
        // if visited is already added then ignore
        if(favObj.type==2){
           // if saved or added to favourite is already added.
           let checkdata = await FavouriteFpo.findOne({ where: { user_id: favObj.user_id,type: favObj.type, fpo_id: favObj.fpo_id }, raw: true });
            if (checkdata) {
               // if data exists update the isActive status.
               await findAndUpdate(FavouriteFpo,{ where: { user_id: favObj.user_id,type: favObj.type, fpo_id: favObj.fpo_id }},{isActive:false})
               return res.Ok({}, "Removed Favourite");
            }else{
               return res.BadRequest({}, "Favourite not exists")
            }
        }else{
          return res.BadRequest({}, "Something went wrong!");
        }
   } catch (err) {
       // if (transaction) await transaction.rollback();
       console.log("error:", err)
       return res.BadRequest({}, "Something went wrong!");
   }
}