// Use after `protect` — checks the decoded JWT's role is "admin".
// To make a user an admin: in MongoDB Atlas, open the `users` collection
// and manually change that user's `role` field from "student" to "admin".
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export default adminOnly;
