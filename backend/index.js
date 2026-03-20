import express from "express";
import { Server } from "socket.io";
import {createServer} from 'node:http'
const PORT = process.env.PORT ?? 3000;

const app = express();
const server = createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    console.log("User connceted")
})
app.get("/", (req, res) => {
    res.send("Hello World!");
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



