const { Router } = require("express");
const dbQuery = require("../utils/db.js");
const { logError } = require("../core/functions.js");
const auth = require("../middlewares/auth.js");

//create new routes for authentication
const userRouter = Router();

userRouter.get('/info', auth, async (req, res) => {
    try {

        const { user_id } = req.user

        const recordExists = await dbQuery(
            `SELECT username, email, phone 
             FROM users 
             WHERE user_id = ?`,
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

module.exports = userRouter;