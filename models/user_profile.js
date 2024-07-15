const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const user_profile = sequelize.define('user_profile', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
          type: type.INTEGER,
          allowNull: true,
          comment: "Foreign Key to user table",
        },
        block_id: {
            type: type.INTEGER,
            allowNull: true,
            comment: "Foreign Key to block table",
        },
        cin: {
            type: type.STRING(21),
            allowNull: false,
            comment: `User organisation CIN no.`,
        },
        company_name: {
            type: type.STRING(200),
            allowNull: false,
            comment: `FPO name`,
        },
        registered_address :{
            type: type.TEXT,
            allowNull: false,
            comment: `FPO address`,
        },
        fpo_pincode:{
            type: type.STRING(6),
            allowNull: true,
            comment: `FPO adress Pincode`,
        },
        bod_kyc_id:{
            type: type.INTEGER,
            allowNull: true,
            comment: "Foreign Key to BOD table",
        },
        pia_name: {
            type: type.STRING(50),
            allowNull: true,
            comment: "PIA Name",
        },
        supporting_agencies : {
            type: type.STRING(50),
            allowNull: true,
            comment: "Name of Supporting Agencies",
        },
        supporting_agencies_from_date : {
            type: type.DATE,
            allowNull: true,
            comment: "Supporting Agencies from date",
        },
        supporting_agencies_to_date : {
            type: type.DATE,
            allowNull: true,
            comment: "Supporting Agencies to date",
        },
        organisation_type:{
            type: type.INTEGER,
            allowNull: true,
            comment: "Type of Organisation",
        },
        registration_number:{
            type: type.STRING(50),
            allowNull: false,
            comment: "Registration number of Company",
        },
        gst_status:{
            type: type.INTEGER,
            allowNull: true,
            comment: "GST Status of Organisation",
        },
        gst_no:{
            type: type.STRING(15),
            allowNull: true,
            comment: "GST No of Organisation",
        },
        gst_upload:{
            type: type.STRING(255),
            allowNull: true,
            comment: "GST File of Organisation",
        },
        email: {
            type: type.STRING(100),
            allowNull: false,
            comment: `Organisation Email ID`,
        },
        mobile: {
            type: type.STRING(10),
            allowNull: true,
            comment: `Organisation Number`,
        },
        description: {
            type: type.TEXT,
            allowNull: true,
            comment: `Organisation description`,
        },
        productionType: {
            type: type.INTEGER,
            allowNull: true,
            comment: `Organisation Production type`,
        },
        number_of_members: {
            type: type.INTEGER,
            allowNull: true,
            comment: `Member farmers count`,
        },
        org_img: {
            type: type.STRING,
            allowNull: true,
            comment: `Organisation logo URL`,
        },
        profile_update: {
            type: type.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: `True if profile is updated by user`,
        },
        membership_type: {
            type: type.INTEGER,
            allowNull: true,
            comment: `Organisation's FPO membership type:1,2,3,4 `,
        },
        major_business_activities: {
            type: type.TEXT,
            allowNull: true,
            comment: `Organisation's Major Business Activities`,
        },
        secondary_email_id: {
            type: type.STRING(50),
            allowNull: true,
            comment: `Organisation's secondary email id`,
        },
        secondary_phone_no: {
            type: type.STRING(10),
            allowNull: true,
            comment: `Organisation's secondary phone no`,
        },
        ceo_name: {
            type: type.STRING(50),
            allowNull: true,
            comment: `CEO Name`,
        },
        ceo_phone_no: {
            type: type.STRING(10),
            allowNull: true,
            comment: `CEO Phone no`,
        },
        poc_email: {
            type: type.STRING(100),
            allowNull: true,
            comment: `Point of Contact Email`,
        },
        poc_phone_no: {
            type: type.STRING(10),
            allowNull: true,
            comment: `Point of Contact Phone no`,
        },
        poc_designation: {
            type: type.INTEGER,
            allowNull: true,
            comment: `Point of Contact Designation, 1: BoD, 2: FPO CEO, 3: FPO Staff, 4: FPO Member`,
        },
        number_of_women_members: {
            type: type.INTEGER,
            allowNull: true,
            comment: `Number of women members`,
        },
        type_of_business: {
            type: type.INTEGER,
            allowNull: true,
            comment: `Type of Business. 1: Input Supply, 2:Marketing, 3: Processing, 4: Procurement, 5: Production, 6: Trading, 7: Organic farming`,
        },
        licenses: {
            type: type.STRING(20),
            allowNull: true,
            comment: `List of Licenses  1:PAN, 2:TAN, 3:GST, 4:MSME certificate, 5:Start up, 6:FSSAI, 7:APMC,8:Others`,
        },
        // MCA Data without any manipulation
        company_category:{
            type: type.INTEGER,
            allowNull: true,
            comment: " Company/LLP Category = 1:Company limited by Shares, 2:Company limited by guarantee, 3:Unlimited company"
        },
        class_of_company:{
            type: type.INTEGER,
            allowNull: true,
            comment:"Public, Private or other Class of company/LLP=1:Private, 2:Public, 3:One person Company"
        },
        address_other_than_r_o:{
            type: type.TEXT,
            allowNull: true,
            comment: "Other Address of the Company/LLP"
        },
        date_of_last_agm:{
            type: type.DATE,
            allowNull: true,
            comment:"Date of Last Annual"
        },
        paid_up_capital:{
            type: type.BIGINT,
            allowNull: true,
            comment: "Paid up capital of company"
        },
        whether_listed_or_not:{
            type: type.INTEGER,
            allowNull: true,
            comment:"Whether company is listed or not in Stock Exchange- 1:Listed, 2:Unlisted"
        },
        suspended_at_stock_exchange:{
            type: type.STRING,
            allowNull: true,
            comment:"Whether company is suspended at a stock exchange or not"
        },
        company_subcategory:{
            type: type.INTEGER,
            allowNull: true,
            comment:"Subcategory of company.1:Union government company,2:State government company,3:Non-government company,4:Subsidiary of company incorporated outside India,5:Guarantee and association company"
        },
        authorised_capital:{
            type: type.BIGINT,
            allowNull: true,
            comment:"Authorised capital of company"
        },
        company_status:{
            type: type.INTEGER,
            allowNull: true,
            comment:"Efiling status of the Company. 1:Active, 2:Dormant, 3:Dormant Under Section 455, 4:Active In Progress, 5:Amalgamated, 6: Not Available for eFiling, 7:Converted to LLP, 8:Converted to LLP and Dissolved, 9:Dissolved, 10: Under Liquidation, 11:Liquidated, 12: Under Process of Striking Off, 13: Strike Off, 14:Capture"
        },
        roc_code:{
            type: type.STRING(100),
            allowNull: true,
            comment:"ROC Code of ROC where Company is registered"
        },
        date_of_balance_sheet:{
            type: type.DATE,
            allowNull: true,
            comment: "Balance Sheet Date"
        },
        date_of_incorporation:{
            type: type.DATE,
            allowNull: true,
            comment: "Date of incorporation of the Company"
        },
        active_compliance:{
            type: type.STRING(100),
            allowNull: true,
        },
        main_division_of_business_activity_to_be_carried_out_in_india:{
            type: type.STRING(100),
            allowNull: true,
        },
        previous_firm_company_details_if_applicable:{
            type: type.STRING(100),
            allowNull: true,
        },
        number_of_designated_partners:{
            type: type.STRING(100),
            allowNull: true,
        },
        total_obligation_of_contribution:{
            type: type.STRING(100),
            allowNull: true,
        },
        description_of_main_division:{
            type: type.STRING(100),
            allowNull: true,
        },
        number_of_partners:{
            type: type.STRING(100),
            allowNull: true,
        },
        charges:{ 
            type: type.TEXT,
            allowNull: true
        },
        directors_signatory_details:{
            type: type.TEXT,
            allowNull: true
        },
        state_code:{
            type: type.STRING(2),
            allowNull: true,
            comment: `FPO state code`,
        },
        


        ...masterKeys
    },
        { freezeTableName: true }
    );
    user_profile.associate = (models) => {
        user_profile.belongsTo(models.user, {
          foreignKey: "user_id",
          targetKey: "id",
          message: "The provided user ID does not exist in the user table.",
        });
        user_profile.belongsTo(models.user, {
          foreignKey: "createdBy",
          targetKey: "id",
          message: "The provided user ID does not exist in the user table.",
        });
        user_profile.belongsTo(models.block, {
            foreignKey: "block_id",
            targetKey: "id",
            message: "The provided user ID does not exist in the user table.",
          });
          user_profile.belongsTo(models.state, {
            foreignKey: "state_code",
            targetKey: "new_code",
            message: "The provided user ID does not exist in the user table.",
          });
        user_profile.hasMany(models.director, {
            foreignKey: "fpo_id"
          });
        user_profile.hasMany(models.favourite_fpo, {
            foreignKey: "fpo_id"
          });
        user_profile.hasMany(models.fpo_supporting_agency_mapper, {
            foreignKey: "fpo_id"
          });
      };

    return user_profile;
};
