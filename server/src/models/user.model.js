import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const interviewHistorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    feedback: { type: String },
    score: { type: Number },
    // Add reference to an actual Interview model later if needed:
    // interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" }
});

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: function () {
                // Password is required only if the user is NOT registering via OAuth
                return !this.googleId && !this.githubId;
            },
        },
        googleId: {
            type: String,
            sparse: true,
        },
        githubId: {
            type: String,
            sparse: true,
        },
        avatar: {
            type: String,
        },
        refreshToken: {
            type: String
        },
        interviewHistory: [interviewHistorySchema],
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Verify password
userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

// Generate JWT
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);