import usermodel from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Get from token
    if (!userId) {
      return res.json({ success: false, message: "User ID not found" });
    }

    const user = await usermodel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        userData: {
          name: user.name,
          isAccountVerified: user.isAccountVerified,
        },
      });
    }

    return res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
