module.exports = {
    ROLE: { ADMIN: "1", FACILITY: "2", FACILITY_MANAGER: "3" },
    _schema: {
    },
    specials: ["`", ";", "*", "%", "&", "|", "*", "~", "<", ">", "^", "(", ")", "[", "]", "{", "}", "$", ";"],
    OTP: {
        OTP_LENGTH: 6,
        OTP_CONFIG: {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true
        },
        isExpired: {
            true: '1',
            false: '0'
        },
        isVerified: {
            true: '1',
            false: '0'
        }
    },
    isActive: {
        true: '1',
        false: '0'
    },
    templateType: {
    },
    SELECT: {
        YES: '1',
        NO: '2',
    },
    ApprovalStatus: {
        Pending: '1',
        Approved: '2',
        Rejected: '3'
    },
    Status: {
        ACTIVE: '1',
        INACTIVE: '2',
    },
}