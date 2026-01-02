import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "abc_kitchen_secret"

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: "Chưa đăng nhập" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: "Token không hợp lệ" })
  }
}
