const express = require('express');
const { json } = require('express');
const dotenv = require('dotenv');
const authRouter = require('./controllers/auth.js');
const cors = require('cors');
const onboardingRouter = require('./controllers/onboarding.js');
const userRouter = require('./controllers/user.js');

//configure access to env variables
dotenv.config();

//create new express app
const app = express();

//set the port number
const port = process.env.PORT || 5000;

//configure app to parse request as JSON
app.use(json());

// List of allowed origins
const allowedOrigins = [
    'http://localhost:5173',
    'https://herhealth.info'
];

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if the origin is in the allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Enable CORS with the configured options
app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Hello, Planet Earth!'
    })
})

//configure authentication route
app.use('/api/auth', authRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/user', userRouter);

app.listen(port, () => {
    console.log(`App is live on port ${port}`);
});