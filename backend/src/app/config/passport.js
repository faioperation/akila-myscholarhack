import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { envVars } from "./env.js";
import prisma from "../prisma/client.js";

// Local Strategy

passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // 👈 changed
      passwordField: "password",
    },
    async (identifier, password, done) => {
      try {
        const isEmail = identifier.includes("@");

        const users = await prisma.user.findMany({
          where: isEmail
            ? { email: identifier }
            : { phoneNumber: identifier },
          include: { auths: true },
        });

        if (!users || users.length === 0) {
          return done(null, false, { message: "User does not exist" });
        }

        // 🚨 phone number not unique → ambiguity check
        if (!isEmail && users.length > 1) {
          return done(null, false, {
            message:
              "Multiple accounts found with this phone number. Please login using email.",
          });
        }

        const user = users[0];

        if (!user.isVerified) {
          return done(null, false, { message: "User is not verified" });
        }

        if (user.status === "BLOCKED" || user.status === "INACTIVE") {
          return done(null, false, {
            message: `User is ${user.status}`,
          });
        }

        if (user.isDeleted) {
          return done(null, false, { message: "User is deleted" });
        }

        const hasGoogleAuth = user.auths.some(
          (auth) => auth.provider === "GOOGLE"
        );

        if (hasGoogleAuth && !user.passwordHash) {
          return done(null, false, {
            message:
              "You signed up with Google. Please set a password first.",
          });
        }

        if (!user.passwordHash) {
          return done(null, false, {
            message: "Password login not available",
          });
        }

        const isPasswordMatched = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!isPasswordMatched) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (error) {
        console.error("LocalStrategy error:", error);
        return done(error);
      }
    }
  )
);
// Google Strategy

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false, { message: "No email found" });
        }

        let user = await prisma.user.findUnique({
          where: { email },
          include: { auths: true },
        });

        if (user) {
          if (!user.isVerified) {
            return done(null, false, { message: "User is not verified" });
          }

          if (user.status === "BLOCKED" || user.status === "INACTIVE") {
            return done(null, false, {
              message: `User is ${user.status}`,
            });
          }

          if (user.isDeleted) {
            return done(null, false, { message: "User is deleted" });
          }
        }

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              picture: profile.photos?.[0]?.value,
              role: "STUDENT",
              isVerified: true,
              auths: {
                create: {
                  provider: "GOOGLE",
                  providerId: profile.id,
                },
              },
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("GoogleStrategy error:", error);
        return done(error);
      }
    }
  )
);

//   Session Handling

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    console.error("deserializeUser error:", error);
    done(error);
  }
});

export default passport;
