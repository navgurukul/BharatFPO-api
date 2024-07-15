const modelPath = require('../../dbConnection/index');
const category = require('../../models/category');

/* Exporting the modelPath object. */
module.exports = {
    User: modelPath.user,
    LoginHistory: modelPath.loginHistory,
    UserProfile: modelPath.user_profile,
    Captcha: modelPath.captcha,
    State: modelPath.state,
    District: modelPath.district,
    Block: modelPath.block,
    SandboxToken:modelPath.sandbox_token,
    ContactUs:modelPath.contact_us,
    FavouriteFpo: modelPath.favourite_fpo,
    Director: modelPath.director,
    MajorBusinessActivities: modelPath.major_business_activities,
    SupportingAgency: modelPath.supporting_agency,
    Category: modelPath.category,
    SubCategory: modelPath.sub_category,
    License: modelPath.license,
    FpoSupportingAgencyMapper:modelPath.fpo_supporting_agency_mapper,
    FinancialYear:modelPath.financial_year,
    FpoInputOutput:modelPath.fpo_input_output
}