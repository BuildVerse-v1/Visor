import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/user.model.js";

const handleOAuthUser = async (profile, done, provider) => {
    try {
        const email = profile.emails?.[0]?.value;
        let user = await User.findOne({ email });

        if (user) {
            // Link provider ID if email exists but provider ID doesn't
            if (provider === 'google' && !user.googleId) user.googleId = profile.id;
            if (provider === 'github' && !user.githubId) user.githubId = profile.id;
            await user.save();
            return done(null, user);
        }

        // Create new user if not found
        user = await User.create({
            username: profile.displayName || profile.username,
            email: email,
            [`${provider}Id`]: profile.id,
            avatar: profile.photos?.[0]?.value,
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
};

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/v1/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => handleOAuthUser(profile, done, "google")
    )
);

// GitHub Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "/api/v1/auth/github/callback",
            scope: ['user:email'],
        },
        (accessToken, refreshToken, profile, done) => handleOAuthUser(profile, done, "github")
    )
);

export default passport;