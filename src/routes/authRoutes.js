const express = require("express");
const bcrypt = require("bcrypt");
const UserModel = require("../models/User");
const SessionModel = require("../models/Session");
const { signJwt, verifyJwt } = require("../core/jwt.core");
const { SUCCESS, ERROR } = require("../core/responseApi");

const authRoutes = express.Router();

// SESSION ROUTES
// --------------

authRoutes.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(401).json(ERROR("Empy value", null, 401));
  try {
    const FoundUser = await UserModel.findOne({ email });
    if (FoundUser)
      return res.status(409).json(ERROR("User Already Exists", null, 409));
    const hashedPassword = await bcrypt.hash(password, 10);
    const toBeSavedUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });
    const result = await toBeSavedUser.save();
    if (result)
      return res
        .status(201)
        .json(SUCCESS("User successfully created!", result, 201));
    else res.status(500).json(ERROR("Error in registering user", null));
  } catch (err) {
    console.log("error in sign up user", err);
  }
});

// Sign In using local parameters
authRoutes.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(401).json(ERROR("Empy value", null, 401));
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json(ERROR("No User found", null, 401));
    if (!bcrypt.compare(password, user.password))
      return res.status(401).json(ERROR("Invalid Credentials", null, 401));
    const payload = { name: user.name, email: user.email };
    const accessToken = await signJwt(payload, "accessTokenPrivateKey", {
      expiresIn: process.env.ACCESS_TOKEN_TTL,
    });
    const refreshToken = await signJwt(payload, "refreshTokenPrivateKey", {
      expiresIn: process.env.REFRESH_TOKEN_TTL,
    });
    const savedSession = await SessionModel.findOne({ user: user._id });
    if (!savedSession) {
      await SessionModel.create({
        user: user._id,
        email,
      });
    }
    res.cookie("refreshToken", refreshToken, {
      maxAge: process.env.REFRESH_TOKEN_TTL,
      httpOnly: true,
    });
    return res
      .status(201)
      .json(SUCCESS("Successfully logged in", { accessToken }));
  } catch (err) {
    console.log("error in signin user", err);
    return res.status(403).json(ERROR("error in signing in user", null, 403));
  }
});

// Resissue access token
authRoutes.post("/reissueToken", async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken)
    return res.status(401).json(ERROR("No refresh token present", null, 401));
  const refreshToken = cookie.refreshToken;
  // validating refresh token
  try {
    const { decoded } = await verifyJwt(refreshToken, "refreshTokenPublicKey");
    if (!decoded || !decoded.email)
      return res.status(401).json(ERROR("Refresh token expired", null, 401));
    const session = await SessionModel.findOne({ email: decoded.email });
    if (!session)
      return res
        .status(401)
        .json(ERROR("Session Expired. Relogin to get new token.", null, 401));
    const user = await UserModel.findOne({ email: session.email });
    if (!user) return res.status(401).json(ERROR("No user found", null, 401));
    const accessToken = signJwt(
      {
        name: user.name,
        email: user.email,
      },
      "accessTokenPrivateKey",
      {
        expiresIn: process.env.ACCESS_TOKEN_TTL,
      }
    );
    if (accessToken)
      return res
        .status(201)
        .json(SUCCESS("Successfully Issued token", { accessToken }));
    else
      return res.status(403).json(ERROR("error in creating token", null, 403));
  } catch {
    console.log("error in reissue token", err);
    return res.status(403).json(ERROR("error in creating token", null, 403));
  }
});

module.exports = authRoutes;
