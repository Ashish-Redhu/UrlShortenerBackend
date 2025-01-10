const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const urlRoutes = require("./routes/urlRoutes");
const userRoutes = require("./routes/userRoutes");
const UrlModel = require("./models/UrlModel");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3201;
const frontendUrl = process.env.FRONTEND_URL; // http://localhost:5173 during development
const backendUrl = process.env.BACKEND_URL;
app.use(express.json()); // Parse incoming JSON
app.use(cookieParser()); // Parse cookies in requests

// CORS Middleware
app.use(cors({
    origin: frontendUrl, // Set to your frontend URL explicitly
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
   // allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow cookies to be sent
}));

// Handle preflight requests for all routes
// app.options('*', cors({
//     origin: frontendUrl,
//     credentials: true,
// }));



// Routes
app.use("/users", userRoutes);
app.use("/urls", urlRoutes);

app.get("/", (req, res) => {
    res.send("URL Shortener Backend is running...");
});

// Redirect route
app.get("/:key", async (req, res) => {
    const { key } = req.params;
    try {
        const { value } = await UrlModel.findOne({ key });

        if (value) {
            res.redirect(value);
        } else {
            res.status(404).json({ error: "URL not found" });
        }
    } catch (err) {
        console.error(`Error in getting response: ${err}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDB connected successfully..."))
    .catch(err => console.error(`Error connecting to MongoDB: ${err}`));

app.listen(PORT, () => {
    console.log(`Server is running on ${backendUrl}`);
});
