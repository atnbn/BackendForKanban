

const cors = require('cors')
const express = require('express');
const connectDB = require('./db');

const authRoutes = require('./routes/auth')
const boardRoutes = require('./routes/board')
const columnRoutes = require('./routes/column')
const taskRoutes = require('./routes/task')
const app = express();
const cookieParser = require('cookie-parser')
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;
const secret_Key = process.env.SECRET_KEY;
const corsOptions = {
    origin: ['http://localhost:4200', 'https://kanban-azure-kappa.vercel.app', 'https://kanban-xhtk.onrender.com/'],
    credentials: true,
    exposedHeader: ['Set-Cookie'],
};
const store = new MongoDBStore({
    uri: MONGODB_URI,

    collection: 'sessions',

});
connectDB();

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(session({
    secret: secret_Key, resave: false, saveUninitialized: false, store: store, cookie: {
        maxAge: 1000 * 60 * 60 * 24, // e.g., 1 day
        secure: false,
        httpOnly: false,
        // sameSite: 'none',
    }
}))

// app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', authRoutes);
app.use('/', boardRoutes);
app.use('/', columnRoutes);
app.use('/', taskRoutes);

store.on('error', function (error) {
    console.log(error);
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


