import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connect from "./db.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import storage from "./memory_storage.js";

var app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/posts", async (req, res) => {
  let db = await connect();

  let cursor = await db
    .collection("ProjectGroups")
    .find()
    .sort({ postedAt: -1 });
  let results = await cursor.toArray();

  res.json(results);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
