const bcrypt = require("bcryptjs");
const db = require("../config/db"); 
const jwt = require("jsonwebtoken");

// --- 1. SIGNUP LOGIC ---
exports.signup = async (req, res) => {
  // This will prove the request actually reached the backend!
  console.log("🚀 Incoming Signup Request:", req.body); 

  const { name, email, password, role } = req.body;

  try {
    // 1. Check if email exists (Using array destructuring for Promises)
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    
    if (existingUsers.length > 0) {
      console.log("⚠️ Email already registered");
      return res.status(400).json({ message: "Email is already registered" });
    }

    // 2. Hash Password
    console.log("🔐 Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save User
    console.log("💾 Saving to database...");
    await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", 
      [name, email, hashedPassword, role]
    );

    console.log("✅ Success! Sending response to frontend.");
    res.status(201).json({ message: "Account created successfully!" });

  } catch (error) {
    console.error("❌ Backend Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- 2. LOGIN LOGIC (Using Promises) ---
exports.login = async (req, res) => {
  console.log("🚀 Incoming Login Request for:", req.body.email);

  const { email, password } = req.body;

  try {
    // 1. Check if the user exists in the database
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    
    // If the array is empty, the email isn't registered
    if (results.length === 0) {
      console.log("⚠️ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    // 2. Compare the typed password with the hashed password
    console.log("🔐 Verifying password...");
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      console.log("⚠️ Invalid password");
      return res.status(401).json({ message: "Invalid credentials" });
    }
    let hasProfile = false;
    
    if (user.role === 'employer') {
        const [empProfile] = await db.query("SELECT * FROM employer_profiles WHERE user_id = ?", [user.user_id]);
        hasProfile = empProfile.length > 0;
    } else if (user.role === 'seeker') {
        const [seekProfile] = await db.query("SELECT * FROM seeker_profiles WHERE user_id = ?", [user.user_id]);
        hasProfile = seekProfile.length > 0;
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // 3. Success! Send back the user data
    console.log("✅ Login successful! Redirecting frontend.");
    res.status(200).json({ 
      message: "Login successful!",
      token: token,
      hasProfile: hasProfile,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};