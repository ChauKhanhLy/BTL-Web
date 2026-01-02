import nodemailer from "nodemailer";

// tạo transporter 1 lần
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Gửi email OTP reset mật khẩu
 */
export const sendResetMail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Bếp Ăn NLD" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Mã OTP đặt lại mật khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
          <h2>🔐 Đặt lại mật khẩu</h2>
          <p>Mã OTP của bạn là:</p>
          <div style="
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 4px;
            margin: 12px 0;
          ">
            ${otp}
          </div>
          <p>Mã này có hiệu lực trong <b>5 phút</b>.</p>
          <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });

    console.log(`📧 OTP mail sent to ${email}`);
  } catch (err) {
    console.error("❌ SMTP REAL ERROR:", err); // 👈 QUAN TRỌNG
    throw err; // 👈 đừng throw error mới
  }

};
