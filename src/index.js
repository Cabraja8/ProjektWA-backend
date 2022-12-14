import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connect from "./db.js";
import cors from "cors";
import jwt from "jsonwebtoken";
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
app.get("/getusers", async (req, res) => {
  let db = await connect();
  let user = req.query.user.username;

  let results;

  try {
    let cursor = await db.collection("Groups").find({ "admin.username": user });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});

app.get("/groups", async (req, res) => {
  let db = await connect();
  let user = req.query.user.username;
  let results;
  try {
    let cursor = await db
      .collection("Groups")
      .find({ "admin.username": { $ne: user } });
    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.get("/group", async (req, res) => {
  let db = await connect();
  let user = req.query.user.username;
  let results;

  try {
    let cursor = await db.collection("Groups").find({ "admin.username": user });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.get("/groupOption/:option", async (req, res) => {
  let db = await connect();
  let option = req.query.pickoption;
  let results;

  try {
    let cursor = await db.collection("Groups").find({ groupname: option });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.put("/joingroup", async (req, res) => {
  let db = await connect();
  let groupname = req.body.groupname;
  let username = req.body.username;
  let doc = {
    username: username,
    role: "Member",
  };

  try {
    await db
      .collection("Groups")
      .updateOne({ groupname: groupname }, { $push: { users: doc } });
  } catch (e) {
    console.log(e);
  }
  res.json(groupname);
});
app.post("/groups", async (req, res) => {
  let db = await connect();
  let user = req.body.admin;
  let groupname = req.body.groupname;
  let companyname = req.body.companyname;
  let groupjoin = req.body.groupjoin;
  console.log(user);
  let doc = {
    groupname: groupname,
    companyname: companyname,
    groupjoin: groupjoin,
    admin: [{ username: user }],
    project: [],
    tasks: [],
    inbox: [],
    users: [],
  };

  try {
    await db.collection("Groups").insertOne(doc);
  } catch (e) {
    console.log(e);
  }
  res.json(groupname);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
