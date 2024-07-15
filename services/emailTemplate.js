//send otp on email at the time of login
exports.sendOtp = (payload) => {
    return {
        subject: 'OTP for Registration!',
        body: `
        <p>Dear User,</p>
        <p>Your one-time password is:&nbsp;<strong>${payload.otp}</strong></p>
        <p>Please use this OTP to complete your Registration or verification process.</p>
        <p>Thank you for using our service!</p>`,
    };
};
exports.forgotOtp = (payload) => {
    return {
        subject: 'OTP for fogot password!',
        body: `
        <p>Dear User,</p>
        <p>Your one-time password is:&nbsp;<strong>${payload.otp}</strong></p>
        <p>Please use this OTP to change your password.</p>
        <p>Thank you for using our service!</p>`,
    };
};
exports.registerUser = (payload) => {
    return {
        subject: 'FPO User Registration',
        body: `
        <p>Dear ${payload.name},</p>
        <p>Your account has been created successfully.</p>
        <p>Your username is: <strong>${payload.email}</strong></p>`
    }
    // <p>Please use this temporary password with username to log in to your account. Once you have logged in, we recommend that you change your password for security purposes.</p>
    // <p>Thank you for using our service!</p>`
};
exports.successPassChange = (payload) => {
    return {
        subject: 'Password Changed Successfully!',
        body: `
        <p>Dear User, having username ${payload.email}</p>
        <p>Your password has been changed successfully.</p>
        <p>Thank you for using our service!</p>`
    }
};