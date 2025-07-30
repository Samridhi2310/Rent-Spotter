require("dotenv").config()
const mongoose=require("mongoose")

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("database connected")
})
.catch((err)=>{
    console.log("database not connected",err)
})
module.exports=mongoose;