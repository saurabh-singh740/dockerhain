import mongoose from "mongoose"

const connectdb=()=>{
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("db connected successfully")
        
    } catch (error) {
        console.log("not connected")
        
    }
}
export default connectdb