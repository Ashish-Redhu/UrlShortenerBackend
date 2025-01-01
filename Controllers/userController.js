const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { UserModel, updateUserType } = require("../models/UserModel");

// 1.) To register a new user.
const registerUser = async (req, res)=>{
    const incomingUser = req.body;
    try{
        const existingUser = await UserModel.findOne({email: incomingUser.email});
        if(existingUser){
           // 400 --> error because of wrong user inputs.
            return res.status(400).json({ message: "User already registerd, try with another email.", data: null});
        }
          // Validate password before hashing
          const passwordValidationRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!passwordValidationRegex.test(incomingUser.password)) {
              return res.status(400).json({ message: "Password must contain at least one letter, one number, and one special character", data: null });
          }

        // Hash the password before saving
       const hashedPassword = await bcrypt.hash(incomingUser.password, 10);
        const newUser = await UserModel.create({
            name: incomingUser.name,
            email: incomingUser.email,
            password: hashedPassword,
        });
        // 200 --> success.
        res.status(201).json({message: "User registered successfully", data: {name: newUser.name, email: newUser.email, walletMoney: newUser.walletMoney}});
    }
    catch(err){
        // 500 server error.
        res.status(500).json({message: "Some error occured while new user creation", error: err.message});
    }
};

// 2.) To login user.
const loginUser = async(req, res)=>{
    const incomingUser = req.body;
    try{
        // 1st check if email itself is there or not.
        const existingUser = await UserModel.findOne({email: incomingUser.email});
        if(!existingUser){
            return res.status(400).json({message: "Invalid email", data: null});
        }
        // 2nd check if hashed passwords are same or not.
        const match = await bcrypt.compare(incomingUser.password, existingUser.password);
        if(!match){
            return res.status(400).json({message: "Password is incorrect", data: null});
        }
         
        // JWT TOKEN:
            // Now role comes of JWT Token which helps to maintain the user loggedin even when browser is closed or page is refreshed.
            const token = jwt.sign(
                {email: existingUser.email, id: existingUser._id, walletMoney: existingUser.walletMoney, name: existingUser.name, type: existingUser.type},     //this is payload.
                process.env.JWT_SECRET,                                // this is secrect key or we can STAMP to verify. But remember this will not go to client.
                {expiresIn: process.env.JWT_EXPIRY}                  // expiry time of this token.
            );
           

        // Now set the JWT in cookie. Because cookies can be changed by server only and not by client directly.
            res.cookie("token", token, {
                httpOnly: true,    // For production
               //httpOnly: false,      // for local development
               expires: new Date(Date.now() + 10*60*1000), // expiration time
               sameSite: 'Strict', // Prevents CSRF attacks
            //    maxAge: 1*60*1000, // as it is stored in milliseconds.
            //    secure: false,
               secure: true,
            })
        // Note: do not forget to do this thing in your frontend axios 'apiService.js'  { withCredentials: true }



        // --------- to update wallet money --------
        const query = { email: existingUser.email };
        let update = { walletMoney: existingUser.walletMoney };
        update = await updateUserType(update);
        await UserModel.findOneAndUpdate(query, update);
        // ------------------------------------------
        
        return res.status(201).json({message: "Successfully logged in", data: {name: existingUser.name, email: existingUser.email, walletMoney: existingUser.walletMoney, type: existingUser.type}});
    }
    catch(error){
        res.status(500).json({message: "Server error occured while logging in", error: error.message});
    } 
};


// 3.) Update wallet money
const updateWallet = async(req, res)=>{
    const {email, amount} = req.body;
    // console.log(`::::::: SERVER.js :::::::::: --> Email is: ${email} and amount is: ${amount}`);
    if(!email){
        return res.status(400).json({message: "User email is required"});
    }
    if(!amount || amount<=0){
        return res.status(400).json({message: "Invalid amount"});
    }

    try {
      const user = await UserModel.findOne({ email });
      // console.log(`User is: ${user}`);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let query = { email };
      let update = { walletMoney: user.walletMoney + amount };
      update = await updateUserType(update);
      await UserModel.findOneAndUpdate(query, update);
      return res
        .status(200)
        .json({
          walletMoney: update.walletMoney,
          message: "Wallet updated successfully",
        });
    } catch (error) {
      console.log("Error updating wallet: ", error);
      return res.status(500).json({ message: "Server error" });
    }
};

// 4.) Verify token in backend.
const verifyToken = async(req, res)=>{

    const token = req.cookies["token"];
    if(!token) return res.status(401).send("No token provided");
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
        if(err) return res.status(401).send("Invalid token");
        return res.json({user: decoded});
    });
};

// 5.) Logout User
const logoutUser = (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie("token", {
            httpOnly: true,
            // httpOnly: false, // Should be true in production
            sameSite: 'Strict', // Prevent CSRF attacks
            // secure: false, // Set to true in production with HTTPS
            secure: true,
        });
        return res.status(200).json({ message: "Successfully logged out" });
    } catch (error) {
        res.status(500).json({ message: "Server error occurred while logging out", error: error.message });
    }
};


module.exports = { registerUser, loginUser, updateWallet, verifyToken, logoutUser };
