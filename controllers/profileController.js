const pool = require('../config/db');

// --- CREATE OR UPDATE SEEKER PROFILE ---
exports.createSeekerProfile = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const { full_name, skills, education, experience, bio, contact_number, github_url, linkedin_url, is_student } = req.body;

        // Ensure only seekers can create this profile
        if (req.user.role !== 'seeker') {
            return res.status(403).json({ message: 'Only job seekers can create this profile' });
        }
        const [result] = await pool.execute(
            `INSERT INTO seeker_profiles 
            (user_id, full_name, skills, education, experience, bio, contact_number, github_url, linkedin_url, is_student) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, full_name, skills, education, experience, bio, contact_number, github_url, linkedin_url, is_student || false]
        );

        res.status(201).json({ message: 'Seeker profile created successfully!', profileId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error creating profile' });
    }
};

// --- CREATE OR UPDATE EMPLOYER PROFILE ---
exports.createEmployerProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { company_name, whatsapp_number, description } = req.body;

        // Ensure only employers can create this profile
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can create this profile' });
        }

        const [result] = await pool.execute(
            `INSERT INTO employer_profiles (user_id, company_name, whatsapp_number, description) 
            VALUES (?, ?, ?, ?)`,
            [userId, company_name, whatsapp_number, description]
        );

        res.status(201).json({ message: 'Employer profile created successfully!', profileId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error creating profile' });
    }
};

// --- GET MY PROFILE (DYNAMIC) ---
exports.getMyProfile = async (req, res) => {
    try {
        const user = req.user;
        const myId = user.id || user.userId || user.user_id;
        const role = user.role?.toLowerCase();
        // Dynamically choose the table based on the JWT role
        const query = role === 'employer' 
            ? 'SELECT * FROM employer_profiles WHERE user_id = ?'
            : 'SELECT * FROM seeker_profiles WHERE user_id = ?';

        const [profiles] = await pool.execute(query, [myId]);

        if (profiles.length === 0) {
            return res.status(404).json({ message: 'Profile not found.' });
        }

        res.status(200).json(profiles[0]);

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ message: 'Server Error fetching profile' });
    }
};

// --- UPDATE MY PROFILE ---
exports.updateMyProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const updates = req.body;

        // 1. Remove fields that should NEVER be manually updated
        delete updates.user_id;
        delete updates.profile_id;
        delete updates.employer_id;
        delete updates.seeker_id;
        delete updates.created_at;

        const fields = Object.keys(updates);
        if (fields.length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        // 2. Dynamically build the SQL SET clause (e.g., "full_name = ?, skills = ?")
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = Object.values(updates);
        
        // Add userId to the end of the values array for the WHERE clause
        values.push(userId);

        const table = role === 'employer' ? 'employer_profiles' : 'seeker_profiles';
        
        // 3. Execute the update
        await pool.execute(
            `UPDATE ${table} SET ${setClause} WHERE user_id = ?`,
            values
        );

        res.status(200).json({ message: 'Profile updated successfully!' });

    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: 'Server Error updating profile' });
    }
};


// --- GET APPLICANT PROFILE BY APPLICATION ID ---
exports.getApplicantByApplicationId = async (req, res) => {
    try {
        // Security check: Only employers should view this
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const appId = req.params.applicationId;
        
        // Join applications and seeker_profiles to get the full profile
        const [profiles] = await pool.execute(
            `SELECT s.* FROM seeker_profiles s
             JOIN applications a ON s.profile_id = a.seeker_id
             WHERE a.application_id = ?`,
            [appId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ message: 'Applicant profile not found.' });
        }

        res.status(200).json(profiles[0]);

    } catch (error) {
        console.error("Fetch Applicant Error:", error);
        res.status(500).json({ message: 'Server Error fetching applicant profile' });
    }
};

// --- GET LOGGED-IN SEEKER'S PROFILE ---
exports.getMyProfile = async (req, res) => {
    try {
        // Ensure only seekers can fetch this specific profile
        if (req.user.role !== 'seeker') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const [profiles] = await pool.execute(
            'SELECT * FROM seeker_profiles WHERE user_id = ?', 
            [req.user.userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ message: 'Profile not found.' });
        }

        res.status(200).json(profiles[0]);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
};
