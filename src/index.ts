import express from 'express';
import path from "path";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { socket_connect } from './socketIo/socketIo';
import SigninController from "./controller/UsersController"
import MessagesController from "./controller/MessagesController"

dotenv.config();
const filePath = path.resolve(__dirname);

export const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: [
    'http://localhost:3000',
    "https://pogos-lls.vercel.app",
    'https://messagefront.holtrinity.com'
  ]}
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    "https://pogos-lls.vercel.app",
    'https://messagefront.holtrinity.com'
  ]
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public",express.static("./public"));
socket_connect(io)

app.use("/users",SigninController);
app.use("/messages",MessagesController);

app.use("/",(req,res) => {
  res.send("Pogos-Llc App Messenger")
});


server.listen(process.env.BACKEND_PORT || 7000, () => {
  console.log(`PORT work -> ${process.env.BACKEND_PORT}`);
});