import { loginService } from "../services/users.service.js"

export const login = async (req, res) => {
  try {
    const { ten_dang_nhap, password } = req.body

    const user = await loginService(ten_dang_nhap, password)

    res.json({
      message: "Đăng nhập thành công",
      user
    })
  } catch (err) {
    switch (err.message) {
      case "MISSING_CREDENTIALS":
        return res.status(400).json({ message: "Thiếu thông tin đăng nhập" })

      case "INVALID_PASSWORD":
        return res.status(401).json({ message: "Sai mật khẩu" })

      case "USER_INACTIVE":
        return res.status(403).json({ message: "Tài khoản bị khoá" })

      default:
        return res.status(401).json({
          message: "Tên đăng nhập không tồn tại"
        })
    }
  }
}
