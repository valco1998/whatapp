import bcrypt from "bcryptjs";
import User from "../models/users.models.js";
import generateTokenAndSetCookie from "../utils/genetateToken.js";

export const signup = async (req, res) => {
	try {
		console.time("signup-total");

		const { fullName, userName, password, confirmPassword, gender } = req.body;
		console.log("Signup - Request received:", req.body);

		if (password !== confirmPassword) {
			console.log("Signup - Passwords don't match.");
			return res.status(400).json({ error: "Passwords don't match" });
		}

		console.time("check-existing-user");
		const existingUser = await User.findOne({ userName });
		console.timeEnd("check-existing-user");

		if (existingUser) {
			console.log("Signup - Username already exists:", userName);
			return res.status(400).json({ error: "Username already exists" });
		}

		console.time("hash-password");
		const salt = await bcrypt.genSalt(10); // אפשר להוריד ל-8 בפיתוח כדי לזרז
		const hashedPassword = await bcrypt.hash(password, salt);
		console.timeEnd("hash-password");

		const profilePic =
			gender === "male"
				? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userName)}`
				: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(userName)}`;
		const newUser = new User({
			fullName,
			userName,
			password: hashedPassword,
			gender,
			profilePic,
		});

		console.time("save-user");
		await newUser.save();
		console.timeEnd("save-user");
		console.log("Signup - User saved:", newUser.userName);

		console.time("token-generation");
		generateTokenAndSetCookie(newUser._id, res);
		console.timeEnd("token-generation");

		console.timeEnd("signup-total");

		res.status(201).json({
			_id: newUser._id,
			fullName: newUser.fullName,
			userName: newUser.userName,
			profilePic: newUser.profilePic,
		});
	} catch (error) {
		console.error("Signup - Error:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		console.time("login-total");

		const { userName, password } = req.body;
		console.log("Login - Attempt for user:", userName);

		const user = await User.findOne({ userName });

		if (!user) {
			console.log("Login - User not found:", userName);
			return res.status(400).json({ error: "Invalid username or password" });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);

		if (!isPasswordCorrect) {
			console.log("Login - Incorrect password for user:", userName);
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		console.timeEnd("login-total");

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			userName: user.userName,
			profilePic: user.profilePic,
		});
	} catch (error) {
		console.error("Login - Error:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Logout - Error:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
