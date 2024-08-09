import express from "express";
import { PORT, mongoDBURL,frontendURL } from "./config.js";
import mongoose from "mongoose";
import booksRoute from "./routes/booksRoute.js";
import usersRoute from "./routes/usersRoute.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors(
    {
        origin : frontendURL,
        methods : ['GET','POST','PUT','DELETE'],
        allowedHeaders : ['Content-Type']
    }
));

app.get("/",(requests, response)=>{
    return response.status(234).send("welcome")
});

app.use("/books",booksRoute);
app.use("/users",usersRoute);


mongoose.connect(mongoDBURL).then(()=>{
    app.listen(PORT); 
}).catch((error)=>{
    console.log(error);
});