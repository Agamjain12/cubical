import dotenv from "dotenv";
import axios from "axios";
import { GoogleLoginService, updateUserType } from "../services/authService.js";
import { generateToken } from "../utils/jwt.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.SECRET;
const REDIRECT_URI = "https://cubical-bw9p.onrender.com/accounts/google/login/callback/";

export const GoogleLogin = async (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email&prompt=select_account`;
  res.redirect(url);
};

export const GoogleLoginCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }
    );

    const { access_token, id_token } = tokenResponse.data;
    const userResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const userData = userResponse.data;
    const user = {
      googleId: userData.id,
      email: userData.email,
      name: userData.name,
      firstName: userData.given_name,
      lastName: userData.family_name,
      profilePicture: userData.picture,
      accessToken: access_token,
      idToken: id_token,
    };

    const response = await GoogleLoginService(user);
    const token = generateToken(response);
    res.json({
      success: true,
      message: "Successfully logged in",
      data: {
        user: {
          googleId: response.googleId,
          email: response.email,
          name: response.name,
          userType: response.userType,
        },
        token,
      },
    });
  } catch (error) {
    console.error(
      "Error during Google authentication:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.response?.data || error.message,
    });
  }
};

export const GoogleLogInHandler = async (req, res) => {
  res.redirect("/");
};

export const logout = async (req, res) => {
  res.json({
    success: true,
    message: "Successfully logged out",
  });
};

export const setUserType = async (req, res) => {
  try {
    const { googleId, userType } = req.body;

    if (!googleId || !userType) {
      return res.status(400).json({
        success: false,
        message: "googleId and userType are required",
      });
    }

    const user = await updateUserType(googleId, userType);

    res.json({
      success: true,
      message: "User type updated successfully",
      data: {
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Error setting user type:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user type",
      error: error.message,
    });
  }
};

// Add a protected route example
export const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        googleId: req.user.googleId,
      },
      select: {
        id: true,
        googleId: true,
        email: true,
        name: true,
        userType: true,
        profilePicture: true,
      },
    });
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};
