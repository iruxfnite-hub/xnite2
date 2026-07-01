"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function completeProfileAction(data: any) {
  try {
    const {
      firstName,
      lastName,
      facebook,
      phone,
      password,
      gingerEmail,
      gingerUsername,
      gingerPassword
    } = data;

    const cookieStore = await cookies();
    const email = cookieStore.get("signup_email")?.value;

    if (!email) {
      return { success: false, error: "Session expired. Please sign in with Google again." };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Account already exists." };
    }

    // Ensure Ginger fields are not already used by another user
    if (gingerEmail) {
      const existingGingerEmail = await prisma.user.findUnique({ where: { gingerEmail } });
      if (existingGingerEmail) {
        return { success: false, error: "This Ginger Email is already linked to another account." };
      }
    }

    if (gingerUsername) {
      const existingGingerUsername = await prisma.user.findUnique({ where: { gingerUsername } });
      if (existingGingerUsername) {
        return { success: false, error: "This Ginger Username is already linked to another account." };
      }
    }

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        facebook,
        phone,
        password,
        gingerEmail,
        gingerUsername,
        gingerPassword,
        isRegistered: true,
        hasCompletedPreCourse: true,
        isDashboardCompleted: true,
        isRulesAndGuidelinesCompleted: true,
        role: "Checker",
        status: "Active"
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in complete profile action:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
