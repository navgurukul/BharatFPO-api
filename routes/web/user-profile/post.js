const { User, OTP, UserProfile, Director, FpoSupportingAgencyMapper } = require('../../../services/all-models');
const { create, getDate, getIdForlist, convertDateFormat, deleteRecord, bulkCreate } = require('../../utils/common-function');
const { Op } = require('sequelize');
// const user_profile = require('../../../models/user_profile');
const userObj = require('../../../models/user');
// const user_profile = require('../../../models/user_profile');
const getOrgData = require("../organisation-details/get");

const list_company_category = [
    { 'id': 1, 'name': "Company limited by Shares" },
    { 'id': 2, 'name': "Company limited by guarantee" },
    { 'id': 3, 'name': "Unlimited company" },
  ];
  const list_class_of_company = [{'id':1, 'name':'Private'}, {'id':2, 'name':'Public'}, {'id':3, 'name':'One person Company'}];
  const list_whether_listed_or_not  = [{'id':1, 'name':'Listed'}, {'id':2, 'name':'Unlisted'}];
  const list_company_subcategory =[{'id':1, 'name':'Union government company'}, {'id':2, 'name':'State government company'}, {'id':3, 'name':'Non-government company'}, {'id':4, 'name':'Subsidiary of company incorporated outside India'}, {'id':5, 'name':'Guarantee and association company'}]
  

/**
Create user's proifle.
@param {*} req - The request object containing user details.
@param {*} res - The response object to send the success or failure response.
@returns The response with status code and message.
*/
module.exports.create = async (req, res, next) => {
    let transaction;
    try {

        let {cin} = req.body
        if (!cin) return res.BadRequest({}, "CIN is required in the body!")
        const condition = { cin: cin, isActive: true };
        const result = await UserProfile.findOne({ where: condition, raw: true });
        if (!result) return res.BadRequest({}, "FPO with proivded CIN does not exists!");
        
        transaction = await sequelize.transaction();
        let userProfileObj = Object.assign({}, req.body);
        delete userProfileObj.transaction;
        userProfileObj.createdBy = req.user.id;
        userProfileObj.user_id = req.user.id;
        userProfileObj.profile_update = true;
        // Supporting Agency Data :create/update
        // Find if supporting agency data exists, then delete it and create new data
        await deleteRecord(FpoSupportingAgencyMapper,{where: {fpo_id: result.id}},{ transaction });
        // Create new data for Suppporting agency 
        let agencyData = [];
        userProfileObj.supporting_agencies_data.forEach(sa => {
            agencyData.push({
                'fpo_id':result.id,
                'supporting_agency_id':sa.supporting_agencies,
                'from_date':sa.supporting_agencies_from_date,
                'to_date':sa.supporting_agencies_to_date,
                'createdBy':req.user.id
            });
        }); 
        
        await bulkCreate(FpoSupportingAgencyMapper, agencyData,{transaction});
        // const FPOSupportingAgency = await create(FpoSupportingAgencyMapper, agencyData, { transaction });

        const [numRows, updatedRows] = await UserProfile.update(userProfileObj, { where: condition, returning: true });
        if (numRows === 0) return res.BadRequest({}, 'Error while getting data for update!');
        transaction.commit();
        // const payload = {
        //     email: userObj.email,
        //     name: userData.facility_name,
        //     password,
        // };
        // // await sendEmail("register", payload)
        return res.Ok({updatedRows}, "Organisation Profile has been updated successfully!")
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.log("error:", err)
        return res.BadRequest({}, "Something went wrong!");
    }
}
/* This is a function that is used to update the User's Profil edata. */
module.exports.update = async (req, res) => {
    let t = await sequelize.transaction();
    try {
        // let { id } = req.user;
        let { cinNumber} = req.body
        if (!cinNumber) return res.BadRequest({}, "CIN cinNumber is required in the body!")
        const condition = { cin: cinNumber, isActive: true };
        const result = await UserProfile.findOne({ where: condition, raw: true });
        if (!result) return res.BadRequest({}, "FPO with proivded CIN does not exists!");
        const obj = req.body;
        obj.updatedAt = Date.now();
        obj.profile_update = true;
        const [numRows, updatedRows] = await UserProfile.update(obj, { where: condition, returning: true });
        if (numRows === 0) return res.BadRequest({}, 'Error while getting data for update!');
        t.commit();
        return res.Ok(updatedRows, "Update Successfully");
    } catch (error) {
        console.log("error:", error);
        t.rollback();
        return res.BadRequest({}, "Something went wrong!");
    }
};

module.exports.createFPO = async(req,res,userObj,ur,transaction)=>{
        // create FPO using MCA api
        req.body.cin = userObj.cin_no;
        req.returnStatus = true;
        const data = await getOrgData(req, res);
        let fpoObj = Object.assign({}, data.data.company_master_data);
        // Mapping the keys
        fpoObj.createdBy = ur.id;
        fpoObj.user_id = ur.id;
        fpoObj.company_category = await getIdForlist(list_company_category,data.data.company_master_data.company_category)
        fpoObj.class_of_company =  await getIdForlist(list_class_of_company,data.data.company_master_data.class_of_company)
            fpoObj.date_of_last_agm = data.data.company_master_data.date_of_last_agm.length === 10 ? convertDateFormat(
          data.data.company_master_data.date_of_last_agm
        ): null;
        fpoObj.date_of_balance_sheet = data.data.company_master_data.date_of_balance_sheet.length === 10 ? convertDateFormat(
          data.data.company_master_data.date_of_balance_sheet
        ):null;
        fpoObj.date_of_incorporation = data.data.company_master_data.date_of_incorporation.length === 10 ? convertDateFormat(
          data.data.company_master_data.date_of_incorporation
        ):null;
        fpoObj.whether_listed_or_not =  await getIdForlist(list_whether_listed_or_not,data.data.company_master_data.whether_listed_or_not)
        fpoObj.company_subcategory =  await getIdForlist(list_company_subcategory,data.data.company_master_data.company_subcategory)
        fpoObj.email = data.data.company_master_data.email_id;
        let directorsArr = data.data["directors/signatory_details"];
        fpoObj.directors_signatory_details = directorsArr
          .map((directorsArr) => JSON.stringify(directorsArr))
          .join(", ");
        // Create FPO
        let fpo = await create(UserProfile, fpoObj,{transaction});
        // Create directors
        let directors = [];
        data.data["directors/signatory_details"].forEach((item) => {
          const fpoDirector = Object();
          fpoDirector.cin = fpo.cin;
          fpoDirector.din = item["din/pan"];
          fpoDirector.fpo_id = fpo.id;
          fpoDirector.director_name = item["name"];
          fpoDirector.createdBy = ur.id;
          fpoDirector.user_id = ur.id;
          directors.push(fpoDirector);
        });

        await bulkCreate(Director, directors,{transaction});

}