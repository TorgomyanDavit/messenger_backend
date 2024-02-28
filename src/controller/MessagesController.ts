
import express, { Request, Response } from "express";
import fs from "fs"
import path from "path";
const filePath = path.resolve(__dirname);

type MessageData = {
  id: string;
  message: string;
  senderId: string;
  receiverId: string;
  date:number
};

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, receiverId } = req.query; 
    if (!userId || !receiverId) {
      return res.status(400).send({ success: false, message: 'Both userId and receiverId parameters are required' });
    }

    const fileData = await fs.promises.readFile(path.resolve(filePath, "../database/messages.json"), "utf-8");
    const messages = fileData === "" ? [] : JSON.parse(fileData) as MessageData[];

    const userMessages = messages.filter(message => 
      (message.receiverId === userId && message.senderId === receiverId) ||
      (message.receiverId === receiverId && message.senderId === userId)
    );

    return res.status(200).send({ success: true, messages: userMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, senderId, receiverId } = req.body as { message: string, senderId: string, receiverId: string };

    const newMessageData: MessageData = {
      id: `${Date.now()}_${Math.random()}`,
      message,
      senderId,
      receiverId,
      date:Date.now()
    };

    let data: MessageData[] = [];
    try {
      const fileData = await fs.promises.readFile(path.resolve(filePath, "../database/messages.json"), "utf-8");
      data = fileData ? JSON.parse(fileData) : [];
    } catch (readError) {
      console.error('Error reading data file:', readError);
    }

    data.push(newMessageData);

    try {
      await fs.promises.writeFile(path.resolve(filePath, "../database/messages.json"), JSON.stringify(data, null, 2));
    } catch (writeError) {
      console.error('Error writing data to file:', writeError);
    }

    return res.status(200).send({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error creating employee:', error);
    return res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

router.delete('/message', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.query as { messageId: string };

    const fileData = await fs.promises.readFile(path.resolve(filePath,"../database/messages.json"), "utf-8");
    const data = JSON.parse(fileData)
    const filteredData = data.filter((val:MessageData) => val.id !== messageId)
    await fs.promises.writeFile(path.resolve(filePath,"../database/messages.json"), JSON.stringify(filteredData, undefined, 2));
  
    res.send({success:true,message:"Message successfully deleted!"})
  } catch (error) {
    console.error('Error creating employee:', error);
    return res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});


export default router;