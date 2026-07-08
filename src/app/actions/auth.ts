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

    // Verify Ginger credentials before creating the user
    try {
      const GINGER_BASE = process.env.NEXT_PUBLIC_GINGER_API_URL || "https://ginger.bitmappro.com";
      
      // Verify Email + Password
      const gingerResEmail = await fetch(`${GINGER_BASE}/bac/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: gingerEmail, password: gingerPassword }),
      });
      const gingerDataEmail = await gingerResEmail.json().catch(() => ({}));

      if (!gingerResEmail.ok || !gingerDataEmail?.credential?.access_token) {
        return { success: false, error: "Invalid Bitmappro Email or Password. Please check your credentials." };
      }

      // Check if the provided username exists somewhere in the response data.
      // Since we know the Ginger API returns the user details in the login response,
      // we strictly enforce that the sitename must be present in the payload.
      const stringifiedData = JSON.stringify(gingerDataEmail).toLowerCase();
      
      // We look for the sitename in the raw JSON response
      if (!stringifiedData.includes(gingerUsername.toLowerCase())) {
        return { success: false, error: "Invalid Bitmappro Sitename. The provided sitename does not match the account." };
      }

    } catch (err) {
      console.error("Ginger verification failed:", err);
      return { success: false, error: "Failed to verify Bitmappro credentials with the server. Please try again later." };
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
        linkedRecruiterEmail: gingerEmail,
        isRegistered: true,
        hasCompletedPreCourse: true,
        isDashboardCompleted: true,
        isRulesAndGuidelinesCompleted: true,
        hasClickedLandCoverTraining: true,
        hasClickedTransportationTraining: true,
        role: "old-labeler",
        status: "Active"
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in complete profile action:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
