const UrlModel = require("../models/UrlModel");
//1.) Default: To shorten URL
const shortenUrl = async(req, res)=>{
    const {value} = req.body;

     if (!value) {
         return res.status(400).send("Value is required.");
     }

    // If that URL already present, means it's key is also there. 
    const tempObj = await UrlModel.findOne({value});
    if(tempObj){
        return res.send(tempObj.key);
    }
    else{
        // if the URL is new but key already present.
        let key = generateRandomString(4);
        while(await UrlModel.findOne({key})){
            key = generateRandomString(4);
        }
        
        try {
            const newUrl = await UrlModel.create({
                key,
                value,
            });

            // Send the generated key as the response
            res.send(newUrl.key);
        } catch (error) {
            // console.error('Error creating URL:', error);
            res.status(500).send('Server error');
        }
    }
};
function generateRandomString(length){
    const characters = 'abcdefghijkmnpqrstwxyz123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
  
//2.) Cutomize URL:
const customizeUrl = async(req, res)=>{
    const {actualurl, customString} = req.body;

    if(!actualurl || !customString){
         return res.status(400).send("Please provide details.");
    }

    //1.) If this URL-shortform combo already present. Then simply return that.
    const tempObj = await UrlModel.findOne({value: actualurl, key: customString});
    if(tempObj){
        return res.status(200).send(tempObj.key);
    }
    //2.) If this key is already present but combined with another big URL.
    const tempObj2 = await UrlModel.findOne({key: customString});
    console.log(tempObj2);
    if(tempObj2){
        return res.status(400).json({message: "Please select a unique custom string!"});
    }
    else{ // 3.) 
        try {
            const newUrl = await UrlModel.create({
                key: customString,
                value: actualurl,
            });
            return res.send(newUrl.key);
        } catch (error) {
            return res.status(500).send('Server error');
        }
    }

};
module.exports = { shortenUrl, customizeUrl };
