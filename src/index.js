import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connect from "./db.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import storage from "./memory_storage.js";
import auth from "./auth.js";
import db from "./db.js";

var app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/tajna", [auth.verify], (req, res) => {
  res.json({ message: "Ovo je tajna " + req.jwt.username });
});
app.post("/auth", async (req, res) => {
  let user = req.body;

  try {
    let result = await auth.authenticateUser(user.username, user.password);
    res.json(result);
  } catch (e) {
    res.json({ error: e.message });
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
app.get("/groups", async (req, res) => {
  let db = await connect();
  let results;
  try {
    let cursor = await db.collection("Groups").find().sort({});
    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.post("/groups", async (req, res) => {
  let db = await connect();
  let group = req.body;

  console.log(group);
  try {
    await db.collection("Groups").insertOne(group);
  } catch (e) {
    console.log(e);
  }
  res.json(group);
});
app.post("/creategroup", async (req, res) => {
  let db = await connect();
  let groupname = req.body.groupname;
  let companyname = req.body.companyname;
  let groupjoin = req.body.groupjoin;
  let doc = {
    group: [
      {
        companyname: companyname,
        groupjoin: groupjoin,
      },
    ],
    users: [
      {
        username: "",
        role: "",
      },
    ],
  };
  console.log(groupname);
  try {
    await db.collection(groupname).insertOne(doc);
  } catch (e) {
    console.log(e);
  }
  res.json(groupname);
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
