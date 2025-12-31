export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Không có quyền truy cập" })
  }
  next()
}
