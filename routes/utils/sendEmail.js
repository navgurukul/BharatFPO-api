const SendEmail = require("../../services/send-email");
const EmailTemplate = require("../../services/emailTemplate");
/**
This function takes in a templateId and a payload as parameters.
The templateId is used to identify the specific email template to be used.
The payload contains the data to be used to populate the email template.
The function then generates an email using the specified template and data.
*/
module.exports = (templateId, payload) => {
    let template = { subject: "", body: "" };
    switch (templateId) {
        case "sendOtp":
            template = EmailTemplate.sendOtp(payload);
            break;
        case "register":
            template = EmailTemplate.registerUser(payload);
            break;
        case "forgotOtp":
            template = EmailTemplate.forgotOtp(payload);
            break;
        case "successPassChange":
            template = EmailTemplate.successPassChange(payload);
            break;
        default:
            break;
    }
    let mailOptions = {
        from: process.env.EMAIL_FROM,
        to: payload.email,
        bcc: payload.bcc,
        cc: payload.cc,
        subject: template.subject,
        html: template.body,
    };
    SendEmail(mailOptions);
};
