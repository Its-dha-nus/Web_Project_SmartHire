const pool = require('../config/db');

// --- CREATE A NEW JOB POSTING (STRICT MODE) ---
exports.createJob = async (req, res) => {
    try {
        // 1. Strict Role Check is BACK ON
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can post jobs' });
        }

        const { title, description, job_type, required_skills, location, salary } = req.body;

        // 2. Look for their employer profile
        const [employers] = await pool.execute(
            'SELECT employer_id FROM Employer_Profiles WHERE user_id = ?', 
            [req.user.userId]
        );

        // 3. NO MORE BYPASS: If they don't have a profile, block them!
        if (employers.length === 0) {
            return res.status(404).json({ message: 'Employer profile not found. Please create one first.' });
        }

        const employerId = employers[0].employer_id;

        // 4. Insert the job
        const [result] = await pool.execute(
            `INSERT INTO Jobs (employer_id, title, description, job_type, required_skills, location, salary) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [employerId, title, description, job_type, required_skills, location, salary]
        );

        res.status(201).json({ message: 'Job posted successfully!', jobId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error posting job' });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        // We will fetch the jobs and JOIN the Employer_Profiles table so we can show the company name!
        const [jobs] = await pool.execute(`
            SELECT Jobs.*, Employer_Profiles.company_name, Employer_Profiles.whatsapp_number 
            FROM Jobs 
            JOIN Employer_Profiles ON Jobs.employer_id = Employer_Profiles.employer_id 
            WHERE Jobs.Status = 'open'
            ORDER BY Jobs.created_at DESC
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
        
        // Grab the job AND the company name it belongs to
        const [jobs] = await pool.execute(
            `SELECT Jobs.*, Employer_Profiles.company_name 
             FROM Jobs 
             JOIN Employer_Profiles ON Jobs.employer_id = Employer_Profiles.employer_id 
             WHERE Jobs.job_id = ?`,
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
        const userId = req.user.userId;

        // 1. Verify they are an employer
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const [employers] = await pool.execute(
            'SELECT employer_id FROM Employer_Profiles WHERE user_id = ?',
            [userId]
        );

        if (employers.length === 0) {
            return res.status(404).json({ message: 'Employer profile not found.' });
        }

        const employerId = employers[0].employer_id;

        // 2. Fetch all jobs posted by this specific employer
        const [jobs] = await pool.execute(
            'SELECT * FROM Jobs WHERE employer_id = ? ORDER BY created_at DESC',
            [employerId]
        );

        // 3. Fetch applications (Date bug is FIXED here)
        const [applications] = await pool.execute(
            `SELECT a.application_id, a.job_id, a.status, 
                    s.full_name, s.skills, s.contact_number, s.linkedin_url, s.github_url 
             FROM Applications a
             JOIN Seeker_Profiles s ON a.seeker_id = s.profile_id
             JOIN Jobs j ON a.job_id = j.job_id
             WHERE j.employer_id = ?
             ORDER BY a.application_id DESC`,
            [employerId]
        );

        // 4. Bundle the applicants neatly inside their respective jobs
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
        const userId = req.user.userId;

        if (req.user.role !== 'seeker') {
            return res.status(403).json({ message: 'Access denied. Seekers only.' });
        }

        const [seekers] = await pool.execute(
            'SELECT profile_id FROM Seeker_Profiles WHERE user_id = ?',
            [userId]
        );

        if (seekers.length === 0) {
            return res.status(404).json({ message: 'Seeker profile not found.' });
        }

        const seekerId = seekers[0].profile_id;

        // THE FIX: Removed a.created_at and changed the ORDER BY
        const [applications] = await pool.execute(
            `SELECT a.application_id, a.status,
                    j.job_id, j.title, j.location, j.job_type,
                    e.company_name
             FROM Applications a
             JOIN Jobs j ON a.job_id = j.job_id
             JOIN Employer_Profiles e ON j.employer_id = e.employer_id
             WHERE a.seeker_id = ?
             ORDER BY a.application_id DESC`,
            [seekerId]
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
        const { status } = req.body; // Will be 'accepted' or 'rejected'

        await pool.execute(
            'UPDATE Applications SET status = ? WHERE application_id = ?',
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
        // 1. Security check: Only employers can delete jobs
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const jobId = req.params.id;
        const employerId = req.user.userId; // From your auth token

        // 2. Delete the job ONLY if it belongs to this specific employer
        const [result] = await pool.execute(
            'DELETE FROM Jobs WHERE job_id = ? AND employer_id = ?',
            [jobId, employerId]
        );

        // If affectedRows is 0, the job didn't exist OR they didn't own it
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
        const employerId = req.user.userId;
        const { title, description, requirements, salary, location, job_type } = req.body;

        const [result] = await pool.execute(
            `UPDATE Jobs 
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

// --- UPDATE A JOB (EMPLOYER ONLY) ---
exports.updateJob = async (req, res) => {
    try {
        // Security Check: Only employers can edit
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const jobId = req.params.id;
        const employerId = req.user.userId;
        const { title, description, requirements, salary, location, job_type } = req.body;

        // Execute the update in MySQL
        const [result] = await pool.execute(
            `UPDATE Jobs 
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
        const seekerId = req.user.userId;

        // Check if the job is already saved
        const [existing] = await pool.execute(
            'SELECT * FROM Saved_Jobs WHERE seeker_id = ? AND job_id = ?',
            [seekerId, jobId]
        );

        if (existing.length > 0) {
            // It exists, so we UNSAVE it
            await pool.execute('DELETE FROM Saved_Jobs WHERE seeker_id = ? AND job_id = ?', [seekerId, jobId]);
            return res.status(200).json({ message: 'Job removed from saved list.', isSaved: false });
        } else {
            // It doesn't exist, so we SAVE it
            await pool.execute('INSERT INTO Saved_Jobs (seeker_id, job_id) VALUES (?, ?)', [seekerId, jobId]);
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

        const seekerId = req.user.userId;

        // Join Saved_Jobs with the Jobs table to get the full job details
        const [savedJobs] = await pool.execute(
            `SELECT j.*, sj.created_at as saved_at 
             FROM Saved_Jobs sj 
             JOIN Jobs j ON sj.job_id = j.job_id 
             WHERE sj.seeker_id = ? 
             ORDER BY sj.created_at DESC`,
            [seekerId]
        );

        res.status(200).json(savedJobs);
    } catch (error) {
        console.error("Fetch Saved Jobs Error:", error);
        res.status(500).json({ message: 'Server error fetching saved jobs.' });
    }
};