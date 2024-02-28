import { Server, Socket } from "socket.io";

export function socket_connect(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log(`Socket.io User is id => ${socket.id}`);
        
        socket.on("send-message", (data: { userId: string, message: string }) => {
            io.emit("receive-message", {success:true});
        });

        socket.on("disconnect", () => {
            console.log("discconnect")
        });
    });
}