import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connect from "./db.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import storage from "./memory_storage.js";
import auth from "./auth.js";

var app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/tajna", (res, req) => {
  console.log(req.headers);
  // res.json({ message: "Ovo je tajna" });
});
app.post("/auth", async (req, res) => {
  let user = req.body;

  try {
    let result = await auth.authenticateUser(user.email, user.password);
    res.json(result);
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
});

app.post("/users", async (req, res) => {
  let user = req.body;

  let id;
  try {
    id = await auth.registerUser(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
  res.json({ id: id });
});

app.get("/posts", async (req, res) => {
  let db = await connect();

  let cursor = await db.collection("ProjectGroups").find().sort({});
  let results = await cursor.toArray();

  res.json(results);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
