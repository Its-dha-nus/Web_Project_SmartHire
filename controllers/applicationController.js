const pool = require('../config/db');

// --- SEEKER: APPLY FOR A FULL-TIME JOB ---
exports.applyForJob = async (req, res) => {
    try {
        if (req.user.role !== 'seeker') {
            return res.status(403).json({ message: 'Only job seekers can apply for jobs' });
        }

        const jobId = req.params.jobId; // We will pass the job ID in the URL

        // 1. Find the seeker's profile ID
        const [seekers] = await pool.execute(
            'SELECT profile_id FROM seeker_profiles WHERE user_id = ?', 
            [req.user.userId]
        );

        if (seekers.length === 0) {
            return res.status(404).json({ message: 'Seeker profile not found. Please create one first.' });
        }
        const seekerId = seekers[0].profile_id;

        // 2. Check if they already applied to prevent spam
        const [existingApps] = await pool.execute(
            'SELECT * FROM applications WHERE job_id = ? AND seeker_id = ?',
            [jobId, seekerId]
        );

        if (existingApps.length > 0) {
            return res.status(400).json({ message: 'You have already applied for this job.' });
        }

        // 3. Submit the application
        await pool.execute(
            'INSERT INTO applications (job_id, seeker_id) VALUES (?, ?)',
            [jobId, seekerId]
        );

        res.status(201).json({ message: 'Application submitted successfully! The employer can now view your profile.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during application' });
    }
};

// --- EMPLOYER: GET APPLICATIONS FOR THEIR JOBS ---
exports.getJobapplications = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can view applications' });
        }

        const jobId = req.params.jobId;

        // Fetch applications and JOIN the seeker's profile so the employer sees their details
        const [applications] = await pool.execute(`
            SELECT applications.application_id, applications.status, applications.applied_at, 
                   seeker_profiles.full_name, seeker_profiles.skills, seeker_profiles.education, 
                   seeker_profiles.experience, seeker_profiles.contact_number, 
                   seeker_profiles.github_url, seeker_profiles.linkedin_url
            FROM applications
            JOIN seeker_profiles ON applications.seeker_id = seeker_profiles.profile_id
            WHERE applications.job_id = ?
        `, [jobId]);

        res.status(200).json(applications);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching applications' });
    }
};