const { Router } = require("express");
const dbQuery = require("../utils/db.js");
const { compareHashedUserInput, hashUserInput, logError } = require("../core/functions.js");
const Jwt = require("jsonwebtoken");

//create new routes for authentication
const authRouter = Router();

//create route for user signup
authRouter.post('/register', async (req, res) => {
    try {

        //destructure payload
        const { username = '', email = '', phone = '', password = '' } = req.body;

        // Check if email address exists already
        const emailExists = await dbQuery('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);

        if (emailExists && emailExists.length > 0) {
            return res.status(400).json({
                status: false,
                error: {
                    message: 'This username or Email address exists already.',
                }
            });
        }

        //hash user's password
        const hashedPassword = await hashUserInput(password.trim());

        // Create new user
        const createUser = await dbQuery('INSERT INTO users (username, email, phone, secret) VALUES (?, ?, ?, ?)', [username.trim().toLowerCase(), email.trim().toLowerCase(), phone.trim(), hashedPassword]);

        //destructure response
        const { affectedRows } = createUser

        // Check if user was created
        if (affectedRows <= 0) {
            return res.status(500).json({
                status: false,
                error: {
                    message: 'Your account was not created, please contact support'
                }
            });
        }

        //return success
        return res.status(200).json({
            status: true,
            message: 'Account created successfully'
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

//create route for user login
authRouter.post('/login', async (req, res) => {
    try {

        //destructure payload
        const { email = '', password = '' } = req.body;

        // Check if account exists
        const emailExists = await dbQuery('SELECT * FROM users WHERE email = ? LIMIT 1', [email.trim().toLowerCase()]);

        if (!emailExists || !emailExists.length) {
            return res.status(400).json({
                status: false,
                error: {
                    message: 'Email address or password is incorrect'
                }
            });
        }

        //get user's Id and secret from db result
        const { user_id, secret } = emailExists?.[0] ?? {}

        let hasCompletedOnboarding = false;

        //compare the password
        if (await compareHashedUserInput(password, secret) === false) {
            return res.status(400).json({
                status: false,
                error: {
                    message: 'Email address or password is incorrect'
                }
            });
        }

        //check if user has completed onboarding
        const onboardingCompleted = await dbQuery(
            `SELECT * 
             FROM insurance 
             INNER JOIN location 
             ON insurance.user_id = location.user_id 
             WHERE insurance.user_id = ? LIMIT 1`,
            [user_id]
        );

        hasCompletedOnboarding = onboardingCompleted && Object.keys(onboardingCompleted).length;

        //sign JWT and send back to the user
        const accessToken = Jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            success: true,
            message: 'You are now logged in',
            data: { accessToken, hasCompletedOnboarding }
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

module.exports = authRouter;