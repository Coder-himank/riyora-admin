import connectDB from '@/lib/database';
import PredefinedData from '@/lib/models/predefinedValues';
async function handler(req, res) {
  if (req.method === 'GET') {
      const { type } = req.query;
      try {
          await connectDB();
          const predefinedData = await PredefinedData.findOne({
              type: type
            });   
            if (!predefinedData) {
                return res.status(404).json({ message: 'Data not found' });
            }
            return res.status(200).json({message : "success" ,data :predefinedData});
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }   
    } 
    else if(req.method === "POST"){
        try{
            await connectDB();
            const { type, data } = req.body;
            if(!type && !data){
                return res.status(400).json({ message: 'Type and data are required' });
            }
            let predefinedData = await PredefinedData.findOne({ type: type });
            if (predefinedData) {
                predefinedData.data = data;
                await predefinedData.save();
            } else {
                predefinedData = new PredefinedData({ type, data });
                await predefinedData.save();
            }   

            return res.status(200).json({ message:"Success",predefinedData});
        }catch(e){
            console.log(e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    else if(req.method === "PUT"){
        try{
            await connectDB();  
            const { type, data } = req.body;
            if(!type&&!data){
                return res.status(400).json({ message: 'Type and data are required' });
            }
            let predefinedData = await PredefinedData.findOne({ type: type });
            if (predefinedData) {
                predefinedData.data = data;
                await predefinedData.save();
                return res.status(200).json(predefinedData);
            } else {
                return res.status(404).json({ message: 'Data not found' });
            }
        }catch(e){
            console.log(e);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    else if(req.method === "DELETE"){
        try{
            await connectDB();
            const { type } = req.body;
            if(!type){
                return res.status(400).json({ message: 'Type is required' });
            }
            let predefinedData = await PredefinedData.findOneAndDelete({ type: type });
            if (predefinedData) {
                return res.status(200).json({ message: 'Data deleted successfully' });
            } else {
                return res.status(404).json({ message: 'Data not found' });
            }
        }catch(e){
            console.log(e);
            return res.status(500).json({ message: 'Server error' });
        }   
    }

    else{
        
      return res.status(405).json({ message: 'Method not allowed' });
    }

}   
export default handler;