import { model, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email already exists"],
      validate: [validator.isEmail, "An Invalid Email"],
      lowercase: true,
      index: true
    },
    phone: String,
    profileImage: String,
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [6, "Too short password"], // security purposes
      // select: false, // best practice so that it's not returned and exposed
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now(),
    },
    passwordResetCode: String,
    passwordResetExpiration: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// const setProfileImageURL = (doc) => {
//   if (doc.profileImage) {
//     const profileImageUrl = `${process.env.BASE_URL}/users/${doc.profileImage}`;
//     doc.profileImage = profileImageUrl;
//   }
// };

// // return url in findOne, findAll and update requests
// userSchema.post("init", (doc) => {
//   setProfileImageURL(doc);
// });

// // return url in create request
// userSchema.post("save", (doc) => {
//   setProfileImageURL(doc);
// });


// Mongoose hooks allow async functions in them. It worked for me. Note that the "next" callback parameter is not needed in async functions as the function executes synchronously.
// Here is what a correct async/await version of the code posted in the question would be. Please note that the corrections are marked in bold:
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  // next();
});

const User = model("User", userSchema);

export default User;