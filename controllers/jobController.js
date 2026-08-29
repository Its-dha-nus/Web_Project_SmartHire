const pool = require('../config/db');

// Safety helper to grab the ID no matter what the JWT named it
const getSafeUserId = (user) => user.id || user.userId || user.user_id;

// --- CREATE A NEW JOB POSTING ---
exports.createJob = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can post jobs' });
        }

        const userId = getSafeUserId(req.user);
        const { title, description, job_type, required_skills, location, salary } = req.body;

        // Verify they have an employer profile first
        const [employers] = await pool.execute(
            'SELECT * FROM employer_profiles WHERE user_id = ?', 
            [userId]
        );

        if (employers.length === 0) {
            return res.status(404).json({ message: 'Employer profile not found. Please create one first.' });
        }

        // FIX: We must insert the User ID (userId) here, NOT the profile ID!
        const [result] = await pool.execute(
            `INSERT INTO jobs (employer_id, title, description, job_type, required_skills, location, salary) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, description, job_type, required_skills, location, salary]
        );

        res.status(201).json({ message: 'Job posted successfully!', jobId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error posting job' });
    }
};

// --- GET ALL JOBS ---
exports.getAllJobs = async (req, res) => {
    try {
        // FIX: Lowercased jobs.status and used LEFT JOIN
        const [jobs] = await pool.execute(`
            SELECT jobs.*, employer_profiles.company_name, employer_profiles.whatsapp_number 
            FROM jobs 
            LEFT JOIN employer_profiles ON jobs.employer_id = employer_profiles.user_id
            WHERE jobs.status = 'open'
            ORDER BY jobs.created_at DESC
        `);

        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching jobs' });
    }
};

// --- GET A SINGLE JOB BY ID ---
exports.getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        
        const [jobs] = await pool.execute(
            `SELECT jobs.*, employer_profiles.company_name, employer_profiles.whatsapp_number
             FROM jobs 
             LEFT JOIN employer_profiles ON jobs.employer_id = employer_profiles.user_id
             WHERE jobs.job_id = ?`,
            [jobId]
        );

        if (jobs.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json(jobs[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching job details' });
    }
};

// --- GET EMPLOYER DASHBOARD DATA ---
exports.getEmployerDashboard = async (req, res) => {
    try {
        const userId = getSafeUserId(req.user);

        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const [jobs] = await pool.execute(
            'SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC',
            [userId]
        );

        // FIX: Reverted the JOIN back to s.profile_id so applicant details actually load!
        const [applications] = await pool.execute(
            `SELECT a.application_id, a.job_id, a.status, 
                    s.full_name, s.skills, s.contact_number, s.linkedin_url, s.github_url 
             FROM applications a
             LEFT JOIN seeker_profiles s ON a.seeker_id = s.profile_id
             JOIN jobs j ON a.job_id = j.job_id
             WHERE j.employer_id = ?
             ORDER BY a.application_id DESC`,
            [userId]
        );

        const dashboardData = jobs.map(job => {
            return {
                ...job,
                applicants: applications.filter(app => app.job_id === job.job_id)
            };
        });

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: 'Server Error fetching dashboard data' });
    }
};

// --- GET SEEKER DASHBOARD DATA ---
exports.getSeekerDashboard = async (req, res) => {
    try {
        const userId = getSafeUserId(req.user);

        if (req.user.role !== 'seeker') {
            return res.status(403).json({ message: 'Access denied. Seekers only.' });
        }

        // 1. Grab the Seeker's Profile ID first!
        const [seekers] = await pool.execute(
            'SELECT profile_id FROM seeker_profiles WHERE user_id = ?',
            [userId]
        );

        if (seekers.length === 0) {
            return res.status(404).json({ message: 'Seeker profile not found.' });
        }

        const profileId = seekers[0].profile_id;

        // 2. Search applications using the Profile ID, not User ID
        const [applications] = await pool.execute(
            `SELECT a.application_id, a.status,
                    j.job_id, j.title, j.location, j.job_type,
                    e.company_name
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             LEFT JOIN employer_profiles e ON j.employer_id = e.user_id
             WHERE a.seeker_id = ?
             ORDER BY a.application_id DESC`,
            [profileId]
        );

        res.status(200).json(applications);

    } catch (error) {
        console.error("Seeker Dashboard Error:", error);
        res.status(500).json({ message: 'Server Error fetching seeker dashboard' });
    }
};

// --- UPDATE APPLICATION STATUS ---
exports.updateApplicationStatus = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can update status' });
        }

        const appId = req.params.applicationId;
        const { status } = req.body; 

        await pool.execute(
            'UPDATE applications SET status = ? WHERE application_id = ?',
            [status, appId]
        );

        res.status(200).json({ message: `Application ${status} successfully!` });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ message: 'Server Error updating status' });
    }
};

// --- DELETE A JOB (EMPLOYER ONLY) ---
exports.deleteJob = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const jobId = req.params.id;
        const employerId = getSafeUserId(req.user); 

        const [result] = await pool.execute(
            'DELETE FROM jobs WHERE job_id = ? AND employer_id = ?',
            [jobId, employerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Job not found or unauthorized.' });
        }

        res.status(200).json({ message: 'Job deleted successfully!' });

    } catch (error) {
        console.error("Delete Job Error:", error);
        res.status(500).json({ message: 'Server Error deleting job.' });
    }
};

// --- UPDATE A JOB (EMPLOYER ONLY) ---
exports.updateJob = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const jobId = req.params.id;
        const employerId = getSafeUserId(req.user);
        const { title, description, requirements, salary, location, job_type } = req.body;

        const [result] = await pool.execute(
            `UPDATE jobs 
             SET title = ?, description = ?, requirements = ?, salary = ?, location = ?, job_type = ? 
             WHERE job_id = ? AND employer_id = ?`,
            [title, description, requirements, salary, location, job_type, jobId, employerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Job not found or unauthorized.' });
        }

        res.status(200).json({ message: 'Job updated successfully!' });

    } catch (error) {
        console.error("Update Job Error:", error);
        res.status(500).json({ message: 'Server Error updating job.' });
    }
};

// --- TOGGLE SAVE JOB (SEEKER ONLY) ---
exports.toggleSaveJob = async (req, res) => {
    try {
        if (req.user.role !== 'seeker') {
            return res.status(403).json({ message: 'Only seekers can save jobs.' });
        }

        const jobId = req.params.id;
        const seekerId = getSafeUserId(req.user);

        const [existing] = await pool.execute(
            'SELECT * FROM saved_jobs WHERE seeker_id = ? AND job_id = ?',
            [seekerId, jobId]
        );

        if (existing.length > 0) {
            await pool.execute('DELETE FROM saved_jobs WHERE seeker_id = ? AND job_id = ?', [seekerId, jobId]);
            return res.status(200).json({ message: 'Job removed from saved list.', isSaved: false });
        } else {
            await pool.execute('INSERT INTO saved_jobs (seeker_id, job_id) VALUES (?, ?)', [seekerId, jobId]);
            return res.status(200).json({ message: 'Job saved successfully!', isSaved: true });
        }
    } catch (error) {
        console.error("Toggle Save Error:", error);
        res.status(500).json({ message: 'Server error while saving job.' });
    }
};

// --- GET ALL SAVED JOBS (SEEKER ONLY) ---
exports.getSavedJobs = async (req, res) => {
    try {
        if (req.user.role !== 'seeker') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const seekerId = getSafeUserId(req.user);

        const [savedJobs] = await pool.execute(
            `SELECT j.*, sj.created_at as saved_at 
             FROM saved_jobs sj 
             JOIN jobs j ON sj.job_id = j.job_id 
             WHERE sj.seeker_id = ? 
             ORDER BY sj.created_at DESC`,
            [seekerId]
        );

        res.status(200).json(savedJobs);
    } catch (error) {
        console.error("Fetch Saved jobs Error:", error);
        res.status(500).json({ message: 'Server error fetching saved jobs.' });
    }
};