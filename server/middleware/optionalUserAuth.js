import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Optional auth middleware: if a valid token exists in cookies, populate req.user.
// If no token or token invalid, proceed as anonymous (do not block access).
const optionalUserAuth = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next();
  }

  try {
    const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (token_decoded && token_decoded.id) {
      // preserve id and any other useful claims (e.g. domain) on req.user
      req.user = { id: token_decoded.id };
      if (token_decoded.domain) req.user.domain = token_decoded.domain;
    }
  } catch (error) {
    // invalid token -> treat as anonymous, do not block the request
  }

  return next();
};

export default optionalUserAuth;
