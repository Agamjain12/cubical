import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const GoogleLoginService = async (userData) => {
  try {
    let user = await prisma.user.findUnique({
      where: {
        googleId: userData.googleId,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userData.googleId,
          email: userData.email,
          name: userData.name,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicture: userData.profilePicture,
          accessToken: userData.accessToken,
          idToken: userData.idToken,
        },
      });
    } else {
      user = await prisma.user.update({
        where: {
          googleId: userData.googleId,
        },
        data: {
          accessToken: userData.accessToken,
          idToken: userData.idToken,
        },
      });
    }

    return user;
  } catch (error) {
    console.error("Error in GoogleLoginService:", error);
    throw error;
  }
};

export const updateUserType = async (googleId, userType) => {
  try {
    if (!["user", "operator"].includes(userType)) {
      throw new Error("Invalid user type. Must be either 'user' or 'operator'");
    }

    const user = await prisma.user.update({
      where: {
        googleId: googleId,
      },
      data: {
        userType: userType,
      },
    });

    return user;
  } catch (error) {
    console.error("Error in updateUserType:", error);
    throw error;
  }
};

export const getAllOperators = async () => {
  try {
    const operators = await prisma.user.findMany({
      where: {
        userType: "operator",
      },
      select: {
        id: true,
        googleId: true,
        email: true,
        name: true,
        profilePicture: true,
      },
    });
    return operators;
  } catch (error) {
    console.error("Error fetching operators:", error);
    throw error;
  }
};
