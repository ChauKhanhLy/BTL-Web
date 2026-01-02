// otp.store.js
const otpStore = new Map();

export function saveOtp(email, otp) {
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
    });
}

export function verifyOtp(email, otp) {
    const record = otpStore.get(email);
    if (!record) return false;

    if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return false;
    }

    if (record.otp !== otp) return false;

    otpStore.delete(email);
    return true;
}
