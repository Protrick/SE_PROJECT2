import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const userAuth = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  try {
    const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (token_decoded && token_decoded.id) {
      req.user = { id: token_decoded.id };
      next();
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    return res.status(403).json({ success: false, message: error.message });
  }
};

export default userAuth;
