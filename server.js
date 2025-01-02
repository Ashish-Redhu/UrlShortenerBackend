const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const urlRoutes = require("./routes/urlRoutes");
const userRoutes = require("./routes/userRoutes");
const UrlModel = require("./models/UrlModel");
// const {authenticateToken} = require("./middlewares/authMiddleware");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3201;
const frontendUrl = process.env.FRONTEND_URL;
// app.use(cors()); // We are using it in development only, so that the client and server running on diff-diff ports can communicate.
app.use(
  cors({
    origin: frontendUrl,      // Toggle this thing during development and production. 
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json()); // we are using it so that json files can be understood by express.
app.use(cookieParser()); // we are using it so that our backend server can parse cookies attached to the incoming requests. Because these cookies are having JWT Token which will help the user to auto-login.
// Starting backend server. 

// Routes
app.use("/users", userRoutes); // Prefix for user-related routes
app.use("/urls", urlRoutes); // Prefix for URL-related routes

app.get("/", (req, res)=>{
  res.send("URL Shortener Backend is running...");
});

// // To redirect URL
app.get("/:key", async (req, res)=>{
    const {key} = req.params;
    try{
        const {value} =  await UrlModel.findOne({key});

        // If short url passed by user is wrong itself.
        if(value){
            res.redirect(value);
        }
        else{
            res.send(404).json({error: "URL not found"});
        }
    }// If some other problem occurs. 
    catch(err){
        console.log(`Some error in getting response ${err}`);
        res.status(500).json({error: "Internal server error"});
    }
});

// Making a connection with database
mongoose.connect(process.env.MONGODB_URL)
.then(
    ()=>{
        console.log("MongoDB connected successfully...");
})
.catch(
    (err)=>{
        console.log(`Some error while creating connection with database ${err}`);
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port:${PORT}  http://localhost:${PORT}`);
})

