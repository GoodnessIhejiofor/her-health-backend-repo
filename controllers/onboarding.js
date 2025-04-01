const { Router } = require("express");
const dbQuery = require("../utils/db.js");
const { logError, sendEmail } = require("../core/functions.js");
const auth = require("../middlewares/auth.js");

//create new routes for authentication
const onboardingRouter = Router();

//create route for user signup
onboardingRouter.post('/health-profile', auth, async (req, res) => {
    try {
        //get userId
        const { user_id } = req.user

        //destructure payload
        const { has_received_treatment = false, has_suffered_cancer = false, has_female_condition = false, has_reproductive_issues = false, has_kids = false } = req.body;

        // Check if email address exists already
        const recordExists = await dbQuery('SELECT * FROM health_profile WHERE user_id = ?', [user_id]);

        let result;

        if (recordExists && recordExists.length > 0) {
            // Perform UPDATE if the record exists
            result = await dbQuery(
                `UPDATE health_profile 
             SET 
               has_received_treatment = ?, 
               has_suffered_cancer = ?, 
               has_female_condition = ?, 
               has_reproductive_issues = ?, 
               has_kids = ? 
             WHERE user_id = ?`,
                [
                    has_received_treatment,
                    has_suffered_cancer,
                    has_female_condition,
                    has_reproductive_issues,
                    has_kids,
                    user_id
                ]
            );
        } else {
            // Perform INSERT if the record does not exist
            result = await dbQuery(
                `INSERT INTO health_profile 
               (user_id, has_received_treatment, has_suffered_cancer, has_female_condition, has_reproductive_issues, has_kids) 
             VALUES 
               (?, ?, ?, ?, ?, ?)`,
                [
                    user_id,
                    has_received_treatment,
                    has_suffered_cancer,
                    has_female_condition,
                    has_reproductive_issues,
                    has_kids
                ]
            );
        }

        //destructure response
        const { affectedRows } = result

        // Check if user was created
        if (affectedRows <= 0) {
            return res.status(500).json({
                status: false,
                error: {
                    message: 'Your profile was not saved, please contact support'
                }
            });
        }

        //return success
        return res.status(200).json({
            status: true,
            message: 'Profile saved successfully'
        });
    } catch (err) {
        logError(err)
        return res.status(500).json({
            success: false,
            error: {
                message: "A server error has occured, please contact support"
            }
        })
    }
});

onboardingRouter.post('/insurance', auth, async (req, res) => {
    try {

        //get userId
        const { user_id } = req.user

        //destructure payload
        const { insurance_type = "" } = req.body;

        // Check if email address exists already
        const recordExists = await dbQuery('SELECT * FROM insurance WHERE user_id = ?', [user_id]);

        let result;

        if (recordExists && recordExists.length > 0) {
            result = await dbQuery(
                `UPDATE insurance
             SET 
               insurance_type = ? 
             WHERE user_id = ?`,
                [
                    insurance_type,
                    user_id
                ]
            );
        } else {
            result = await dbQuery(
                `INSERT INTO insurance 
              (user_id, insurance_type) 
             VALUES 
              (?, ?)`,
                [
                    user_id,
                    insurance_type
                ]
            );
        }

        //destructure response
        const { affectedRows } = result

        // Check if user was created
        if (affectedRows <= 0) {
            return res.status(500).json({
                status: false,
                error: {
                    message: 'Your profile was not saved, please contact support'
                }
            });
        }

        //return success
        return res.status(200).json({
            status: true,
            message: 'Profile saved successfully'
        });
    } catch (err) {
        logError(err)
        return res.status(500).json({
            success: false,
            error: {
                message: "A server error has occured, please contact support"
            }
        })
    }
});

onboardingRouter.post('/location', auth, async (req, res) => {
    try {

        //get userId
        const { user_id } = req.user

        //destructure payload
        const { location = "" } = req.body;

        // Check if email address exists already
        const recordExists = await dbQuery('SELECT * FROM location WHERE user_id = ?', [user_id]);

        let result;

        if (recordExists && recordExists.length > 0) {
            result = await dbQuery(
                `UPDATE location
             SET 
               location = ? 
             WHERE user_id = ?`,
                [
                    location,
                    user_id
                ]
            );
        } else {
            result = await dbQuery(
                `INSERT INTO location 
              (user_id, location) 
             VALUES 
              (?, ?)`,
                [
                    user_id,
                    location
                ]
            );
        }

        //destructure response
        const { affectedRows } = result

        // Check if user was created
        if (affectedRows <= 0) {
            return res.status(500).json({
                status: false,
                error: {
                    message: 'Your profile was not saved, please contact support'
                }
            });
        }

        //return success
        return res.status(200).json({
            status: true,
            message: 'Profile saved successfully'
        });
    } catch (err) {
        logError(err)
        return res.status(500).json({
            success: false,
            error: {
                message: "A server error has occured, please contact support"
            }
        })
    }
});

onboardingRouter.get('/info', auth, async (req, res) => {
    try {

        const { user_id } = req.user

        const recordExists = await dbQuery(
            `SELECT * 
             FROM insurance 
             INNER JOIN location 
             ON insurance.user_id = location.user_id 
             WHERE insurance.user_id = ? LIMIT 1`,
            [user_id]
        );

        return res.status(200).json({
            status: true,
            data: {
                info: recordExists?.[0],
            }
        });
    } catch (err) {
        logError(err)
        return res.status(500).json({
            success: false,
            error: {
                message: "A server error has occured, please contact support"
            }
        })
    }
})

onboardingRouter.post('/send-email', auth, async (req, res) => {
    try {

        const { user_id, username, email } = req.user

        const record = await dbQuery(
            `SELECT * FROM location 
             WHERE user_id = ? LIMIT 1`,
            [user_id]
        );

        const result = record?.[0]?.location

        const emailBody = `
        <p>Dear ${username},</p>
    
        <p>We hope you are doing well!</p>
    
        <p>This is a friendly reminder that your next scheduled appointment is coming up.</p>
    
        <p><strong>📅 Date:</strong> 3rd June 2025<br>
        <strong>📍 Location:</strong> ${result + ' General Hospital'}<br>
        <strong>👨‍⚕️ Doctor:</strong> John Doe</p>
    
        <p>Please ensure you arrive on time and bring any necessary documents or medical history with you.</p>
    
        <p>If you have any questions or need to reschedule, feel free to contact us.</p>
    
        <p>Best regards,</p>
        <p><strong>Oluoma Ihejiofor</strong><br>
        <a href="mailto:support@herhealth.info">support@herhealth.info</a> | +123 456 7890</p>
    `;

        const resp = await sendEmail({
            emailSubject: "[REMINDER]: YOUR NEXT APPOINTMENT AWAITS",
            recipientEmail: email,
            emailBody
        })

        if (resp) {
            return res.status(200).json({
                status: true,
                message: "Email sent"
            });
        } else {
            return res.status(400).json({
                status: false,
                error: {
                    message: "Email was not sent"
                }
            });
        }

    } catch (err) {
        logError(err)
        return res.status(500).json({
            success: false,
            error: {
                message: "A server error has occured, please contact support"
            }
        })
    }
})

module.exports = onboardingRouter;