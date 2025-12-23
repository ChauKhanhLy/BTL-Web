import nodemailer from "nodemailer";

export const sendResetMail = async (email, resetLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Bếp Ăn NLD" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Khôi phục mật khẩu tài khoản Bếp Ăn NLD",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
          <h2>Xin chào,</h2>
          <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
          <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
          <a href="${resetLink}" 
             style="display:inline-block;padding:10px 20px;background:#1f8a70;color:white;text-decoration:none;border-radius:8px">
             Đặt lại mật khẩu
          </a>
          <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Đã gửi email khôi phục đến ${email}`);
  } catch (err) {
    console.error("Lỗi khi gửi email:", err);
    throw err;
  }
};
