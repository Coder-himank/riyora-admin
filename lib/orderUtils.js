// functions to hanle order status, cancelation ,confirmation
import axios from "axios"
import toast from "react-hot-toast"

export const updateStatus = async (orderId, status) => {
    console.log("updating");
    
    try {
        await axios.put(`/api/orderApi`, { orderId, updatedFields : {status} })
        toast.success(`${orderId} is Updated`)
        return true
    } catch (err) {
        console.log("error updating"+err);
        
        toast.error("Error Upadating the Order Status")
    }

    return false
}

export const fetchLabel = async ({ orderIds }) => {
    try {
        const orderList = Array.isArray(orderIds) ? orderIds : [orderIds]
        // toast.success(orderList.toString())
        console.log(orderList);
        


        const res = await axios.post("/api/fetchLabelsApi", {
            orders: orderList
        });

        toast.success("Label Fetched");

        return res.data; // ✅ Return actual response (labels)
    } catch (err) {
        console.error("Fetch Label Error:", err);
        toast.error("Unable To Fetch Label");
    }
    return null;
};

export const updateOrder = async ({ orderId, updatedFields }) => {
    try {
        await axios.put(`/api/orderApi`, { orderId, updatedFields })
        toast.success(`${orderId} is Updated`)
        return true
    } catch (err) {
        toast.error("Error Upadating the Order " + err)
        // alert("Error Upadating the Order " + err)
    }

    return false
}



export default updateStatus;