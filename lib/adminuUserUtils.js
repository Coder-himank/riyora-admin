import adminUser from "@/lib/models/adminUser"
import {connectDB} from "@/lib/database"
const fetchUser = async (userID) => {
    try{
        await connectDB()
        const user = await adminUser.findById(userID)
        return user
    }catch(err){

    return false

    }
}
 