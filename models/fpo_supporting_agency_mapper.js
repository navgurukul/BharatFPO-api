const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const FpoSupportingAgencyMapper = sequelize.define('fpo_supporting_agency_mapper', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fpo_id: {
            type: type.INTEGER,
            comment: `FPO id of this supporting agency `,
            allowNull: false,
        },
        supporting_agency_id: {
            type: type.INTEGER,
            allowNull: false,
            comment: `supporting agency id`
        },
        from_date: {
            type: type.DATE,
            allowNull: true,
            comment: "From date of the supporting agency",
        },
        to_date: {
            type: type.DATE,
            allowNull: true,
            comment: "To date of the supporting agency",
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    FpoSupportingAgencyMapper.associate = (models) => {
        FpoSupportingAgencyMapper.belongsTo(models.user_profile, {
          foreignKey: "fpo_id",
          targetKey: "id",
          message: "The provided FPO ID does not exist in the user profile table.",
        });
        FpoSupportingAgencyMapper.belongsTo(models.supporting_agency, {
            foreignKey: "fpo_id",
            targetKey: "id",
            message: "The provided FPO ID does not exist in the user profile table.",
          });

      };
    return FpoSupportingAgencyMapper;
};
