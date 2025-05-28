import connectMongoDB from "@/lib/mongodb";
import Message from '@/models/Message'; 
import Community from '@/models/Community'; 

export default async function handler(req, res) {
  const { id } = req.query; // Community ID
  await connectMongoDB();

  if (req.method === 'GET') {
    try {
      // Find messages for the specific community, sorted by timestamp
      const messages = await Message.find({ community: id }).sort({ timestamp: 1 });
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { sender, text } = req.body;
      if (!sender || !text) {
        return res.status(400).json({ success: false, message: 'Sender and text are required.' });
      }

      const communityExists = await Community.findById(id);
      if (!communityExists) {
        return res.status(404).json({ success: false, message: 'Community not found.' });
      }

      const message = await Message.create({
        community: id,
        sender,
        text,
      });
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}