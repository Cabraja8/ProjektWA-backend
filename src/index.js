import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-Parser";
import connect from "./db.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import storage from "./memory_storage.js";

var app = express();
const port = 3000;

// app.use(bodyParser.json());
app.use(cors());

var tempStorage = [];

// app.get("/vratisvekorisnike", async (req, res) => {
//   // let db = await connect();

//   // let cursor = await db.collection("ProjectGroups").find().sort();
//   // let results = await cursor.toArray();

//   // res.send("Hello World!");
//   // res.json(results);
//   console.log(tempStorage);
//   res.send(tempStorage);
// });

// app.post("/dodajKorisnika", (req, res) => {
//   var data = req.body;
//   console.log(data);
//   var dataid = "1234";

//   console.log(data);
//   tempStorage.push(data);
//   res.send(tempStorage);
// });

app.get("/posts", (req, res) => {
  res.json(storage.posts);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
