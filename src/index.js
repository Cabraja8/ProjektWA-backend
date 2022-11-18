// import express from "express";
// import connect from "./db.js";
// var connect = require("./db.js");

var express = require("express");
var app = express();
const port = 3000;

// app.use(bodyParser.json());

var tempStorage = [];

app.get("/vratisvekorisnike", async (req, res) => {
  // let db = await connect();

  // let cursor = await db.collection("ProjectGroups").find().sort();
  // let results = await cursor.toArray();

  // res.send("Hello World!");
  // res.json(results);
  console.log(tempStorage);
  res.send(tempStorage);
});

app.post("/dodajKorisnika", (req, res) => {
  var data = req.body;
  console.log(data);
  var dataid = "1234";

  console.log(data);
  tempStorage.push(data);
  res.send(tempStorage);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
