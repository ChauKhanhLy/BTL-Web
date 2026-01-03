import * as userService from "../services/users.service.js";

/* GET /api/users */
export async function getUsers(req, res) {
  try {
    const { status = "all", search = "" } = req.query;
    const data = await userService.getUsers({ status, search });
    res.json(data);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* GET /api/users/:id */
export async function getUserProfile(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

/* POST /api/users */
export async function createUser(req, res) {
  try {
    const user = await userService.createUser(req.body);
    console.log("CREATE USER BODY:", req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/* DELETE /api/users/:id */
export async function deleteUser(req, res) {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/* PUT /api/users/:id/status */
export async function updateUserStatus(req, res) {
  try {
    const { status } = req.body;
    const user = await userService.updateStatus(req.params.id, status);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/* POST /api/users/:id/invite */
export async function sendInvite(req, res) {
  try {
    await userService.sendInvite(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
