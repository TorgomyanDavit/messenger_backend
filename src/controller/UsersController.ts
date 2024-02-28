
import express, { Request, Response } from "express";
import fs from "fs"
import path from "path";
import { DeleteImgFileFromImages, upload } from "../multerImgPicker/imgPicker";

interface UserData {
  id: string;
  name: string;
  images: string;
}

type MessageData = {
  id: string;
  message: string;
  senderId: string;
  receiverId: string;
};

const filePath = path.resolve(__dirname);

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const fileData = await fs.promises.readFile(path.resolve(filePath,"../database/users.json"), "utf-8");

    const response = JSON.parse(fileData)
    const data = response.map((val:UserData) => (
      {
        ...val,
        images:`${process.env.BACKEND_APP_BASEURL}/${val.images}`
      }
    ))

    return res.send({ success: true, data: data });
  } catch (error) {
    console.error('Error creating employee:', error);
    return res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

router.post("/signin", upload.single("photo"), async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File; // Type cast req.file to Multer File type
    const { name } = req.body as { name: string }; // Type cast req.body to an object with 'name' property of string type
    
    const newUserData:UserData = {
      id: `${Date.now()}_${Math.random()}`,
      name,
      images: file.filename
    };

    let data: UserData[] = [];
    try {
      const fileData = await fs.promises.readFile(path.resolve(filePath,"../database/users.json"), "utf-8");
      data = fileData === "" ? [] : JSON.parse(fileData) as UserData[];
      const userExist = data.find((val) => val.name === name)

      
      if(userExist) {
        return res.send({ success: false, token: undefined });
      } else {
        data.push(newUserData)
        await fs.promises.writeFile(path.resolve(filePath,"../database/users.json"), JSON.stringify(data, undefined, 2));
        return res.send({ success: true, token: newUserData.id });
      }
    } catch (readError) {
      console.error('Error reading data file:', readError);
    }


  } catch (error) {
    return res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

router.post("/login",async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string }; // Type cast req.body to an object with 'name' property of string type

    const fileData = await fs.promises.readFile(path.resolve(filePath,"../database/users.json"), "utf-8");
    const data = fileData === "" ? [] : JSON.parse(fileData) as UserData[];

    if(data.length) {
      const user = data.find((val) => val.name === name)

      if(user) {
        return res.send({ success: true, token: user.id });
      } else {
        return res.send({ success: false, token:undefined });
      }
    } else {
      return res.send({ success: false, token:undefined });

    }
  } catch (error) {
    return res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const { userId } = req.query;
    const fileData = await fs.promises.readFile(path.resolve(filePath, "../database/users.json"), "utf-8");
    const messageData = await fs.promises.readFile(path.resolve(filePath, "../database/messages.json"), "utf-8");

    const data = JSON.parse(fileData);
    const currentUser = data.find((val:UserData) => val.id === userId);

    if (!currentUser) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    DeleteImgFileFromImages(currentUser.images);
    const filteredData = data.filter((val:UserData) => val.id !== userId);
    const messages = messageData === "" ? [] : JSON.parse(messageData) as MessageData[];
    const userMessages = messages.filter(message => message.senderId !== userId);

    await fs.promises.writeFile(path.resolve(filePath, "../database/messages.json"), JSON.stringify(userMessages, null, 2));
    await fs.promises.writeFile(path.resolve(filePath, "../database/users.json"), JSON.stringify(filteredData, undefined, 2));

    res.send({ success: true, message: "User and associated messages successfully deleted!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ success: false, message: "An error occurred while deleting user and messages." });
  }
});


export default router;