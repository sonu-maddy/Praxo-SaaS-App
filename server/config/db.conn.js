import mongoose from "mongoose"

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DB_CONNECTION);
        console.log("DB Conneted");
        
    }catch (error){
        console.log("connetion failed");
        
    }
}
export default connectDB;