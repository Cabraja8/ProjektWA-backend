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

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET,HEAD,OPTIONS,POST,PUT,DELETE"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content Type, Accept, Authorization"
//   );
//   next();
// });

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

app.get("/GetJoinedGroups", async (req, res) => {
  let db = await connect();
  let user = req.query.user.username;
  let results;

  try {
    let cursor = await db.collection("Groups").find({ "users.username": user });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.get("/GetYourGroup", async (req, res) => {
  let db = await connect();
  let user = req.query.user.username;
  let results;

  try {
    let cursor = await db.collection("Groups").find({ admin: user });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.put("/LeaveGroup", async (req, res) => {
  let db = await connect();
  let user = req.body.params.user.username;
  let groupname = req.body.params.groupname;

  try {
    await db
      .collection("Groups")
      .updateOne(
        { groupname: groupname },
        { $pull: { users: { username: user } } }
      );
  } catch (e) {
    console.log(e);
  }
  res.json(groupname);
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
app.get("/getUserList", async (req, res) => {
  let db = await connect();
  let pickoption = req.query.pickoption;
  let results;

  try {
    let cursor = await db.collection("Groups").find({ groupname: pickoption });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.get("/getAllUsers", async (req, res) => {
  let db = await connect();
  let user = req.query.user.username;
  let notingroup = [];
  notingroup = req.query.notingroup;
  let results;
  let search = req.query.search;
  console.log(search);

  if (typeof notingroup === "undefined") {
    if (search !== "") {
      try {
        let cursor = await db.collection("users").find({
          $and: [{ username: { $ne: user } }, { username: new RegExp(search) }],
        });

        results = await cursor.toArray();
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        let cursor = await db.collection("users").find({
          username: { $ne: user },
        });

        results = await cursor.toArray();
      } catch (e) {
        console.log(e);
      }
    }
  } else {
    if (search !== "") {
      try {
        let cursor = await db.collection("users").find({
          $and: [
            { username: { $ne: user } },
            { username: { $nin: notingroup } },
            { username: new RegExp(search) },
          ],
        });

        results = await cursor.toArray();
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        let cursor = await db.collection("users").find({
          $and: [
            { username: { $ne: user } },
            { username: { $nin: notingroup } },
          ],
        });

        results = await cursor.toArray();
      } catch (e) {
        console.log(e);
      }
    }
  }
  res.json(results);
});
app.get("/getusers", async (req, res) => {
  let db = await connect();
  let pickoption = req.query.pickoption;
  let results;

  try {
    let cursor = await db.collection("Groups").find({ groupname: pickoption });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.put("/EditUserRole", async (req, res) => {
  let db = await connect();
  let picktoption = req.body.params.pickoption;
  let role = req.body.params.roles;

  let name = req.body.params.name;

  try {
    await db
      .collection("Groups")
      .updateOne(
        { groupname: picktoption, "users.username": name },
        { $set: { "users.$.role": role } }
      );
  } catch (e) {
    console.log(e);
  }
  res.json();
});

app.put("/EditUserNotes", async (req, res) => {
  let db = await connect();
  let picktoption = req.body.params.pickoption;
  let notes = req.body.params.notes;

  let name = req.body.params.name;

  try {
    await db
      .collection("Groups")
      .updateOne(
        { groupname: picktoption, "users.username": name },
        { $set: { "users.$.notes": notes } }
      );
  } catch (e) {
    console.log(e);
  }
  res.json();
});
app.put("/DeclineInvite", async (req, res) => {
  let db = await connect();
  let username = req.body.params.username;
  let pickoption = req.body.params.pickoption;

  try {
    await db
      .collection("Groups")
      .updateOne(
        { groupname: pickoption, "inbox.username": username },
        { $pull: { inbox: { username: username } } }
      );
  } catch (e) {
    console.log(e);
  }
  res.json();
});
app.put("/KickUser", async (req, res) => {
  let db = await connect();
  let username = req.body.params.username;
  let pickoption = req.body.params.pickoption;

  try {
    await db
      .collection("Groups")
      .updateOne(
        { groupname: pickoption, "users.username": username },
        { $pull: { users: { username: username } } }
      );
  } catch (e) {
    console.log(e);
  }
  res.json();
});

app.get("/GetInbox", async (req, res) => {
  let db = await connect();
  let option = req.query.pickoption;
  let results;

  try {
    let cursor = await db.collection("Groups").find({ groupname: option }, {});

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.put("/DontJoin", async (req, res) => {
  let db = await connect();
  let user = req.body.params.user.username;
  let groupname = req.body.params.groupname;

  try {
    await db
      .collection("users")
      .updateOne(
        { username: user },
        { $pull: { dm: { groupname: groupname } } }
      );
  } catch (e) {
    console.log(e);
  }

  res.json(groupname);
});
app.get("/getInviteList", async (req, res) => {
  let db = await connect();
  let user = req.query.user.username;

  let results;
  try {
    let cursor = await db.collection("users").find({ username: user });
    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.put("/joingroupinvite", async (req, res) => {
  let db = await connect();
  let groupname = req.body.params.groupname;
  let username = req.body.params.user.username;

  let doc = {
    username: username,
    role: "Member",
    notes: "",
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
app.put("/InviteUser", async (req, res) => {
  let db = await connect();
  let user = req.body.params.username;
  let pick = req.body.params.pickoption;
  let admin = req.body.params.admin.username;

  let doc = {
    groupname: pick,
    admin: admin,
  };

  try {
    await db
      .collection("users")
      .updateOne({ username: user }, { $push: { dm: doc } });
  } catch (e) {
    console.log(e);
  }

  res.json(pick);
});

app.put("/AskToJoinGroup", async (req, res) => {
  let db = await connect();
  let user = req.body.params.user.username;
  let groupname = req.body.params.groupname;
  console.log(user, "user");
  console.log(groupname, "groupname");

  let doc = {
    username: user,
  };

  try {
    await db
      .collection("Groups")
      .updateOne({ groupname: groupname }, { $push: { inbox: doc } });
  } catch (e) {
    console.log(e);
  }

  res.json(groupname);
});

app.put("/DeleteTask", async (req, res) => {
  let db = await connect();
  let pickoption = req.body.params.pickoption;
  let taskname = req.body.params.taskname;
  try {
    await db
      .collection("Groups")
      .updateOne(
        { groupname: pickoption },
        { $pull: { tasks: { taskname: taskname } } }
      );
  } catch (e) {
    console.log(e);
  }
  res.json();
});

app.get("/GetGroupInfo", async (req, res) => {
  let db = await connect();
  let opt = req.query.pickoption;

  let results;
  try {
    let cursor = await db.collection("Groups").find({ groupname: opt });
    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.get("/GetGroupPick", async (req, res) => {
  let db = await connect();

  let user = req.query.user.username;
  let results;

  try {
    let cursor = await db.collection("Groups").find({ "users.username": user });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.get("/GetTaskUserList", async (req, res) => {
  let db = await connect();
  let groupname = req.query.groupname;
  let user = req.query.user.username;
  let results;

  try {
    let cursor = await db.collection("Groups").find({
      $and: [{ groupname: groupname }, { "tasks.ForUser": user }],
    });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});

app.get("/GroupName", async (req, res) => {
  let db = await connect();
  let option = req.query.option;

  let results;

  try {
    let cursor = await db.collection("Groups").find({ groupname: option });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.put("/EditProjectInformation", async (req, res) => {
  let db = await connect();
  let option = req.body.params.option;

  let info = req.body.params.info;
  try {
    await db
      .collection("Groups")
      .updateOne(
        { groupname: option },
        { $set: { "project.information": info } }
      );
  } catch (e) {
    console.log(e);
  }

  res.json(option);
});
app.get("/GetGroupsForMod", async (req, res) => {
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
app.put("/CreateTask", async (req, res) => {
  let db = await connect();

  let groupname = req.body.params.pickoption;
  let TaskData = req.body.params.TaskData;

  let doc;
  if (TaskData.DeadlineData === "Deadline") {
    doc = {
      taskname: TaskData.taskname,
      taskDesc: TaskData.taskDesc,
      ForUser: TaskData.ForUser,
      DeadLine: TaskData.DateInput,
    };
  } else {
    doc = {
      taskname: TaskData.taskname,
      taskDesc: TaskData.taskDesc,
      ForUser: TaskData.ForUser,
      DeadLine: "No Deadline",
    };
  }

  try {
    await db
      .collection("Groups")
      .updateOne({ groupname: groupname }, { $push: { tasks: doc } });
  } catch (e) {
    console.log(e);
  }

  res.json();
});
app.put("/EditProjectDescription", async (req, res) => {
  let db = await connect();
  let option = req.body.params.option;

  let desc = req.body.params.description;

  try {
    await db
      .collection("Groups")
      .updateOne(
        { groupname: option },
        { $set: { "project.description": desc } }
      );
  } catch (e) {
    console.log(e);
  }

  res.json(option);
});
app.put("/ClearCompletedTask", async (req, res) => {
  let db = await connect();
  let results;

  let taskname = req.body.params.taskname;
  let option = req.body.params.pickoption;

  try {
    await db
      .collection("Groups")
      .updateOne(
        { groupname: option },
        { $pull: { completedTasks: { taskname: taskname } } }
      );
  } catch (e) {
    console.log(e);
  }

  res.json(results);
});
app.get("/GetCompletedTasks", async (req, res) => {
  let db = await connect();
  let pickoption = req.query.pickoption;
  let results;

  try {
    let cursor = await db.collection("Groups").find({ groupname: pickoption });
    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }

  res.json(results);
});
app.get("/GetTaskList", async (req, res) => {
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
app.get("/ProjectInfo", async (req, res) => {
  let db = await connect();
  let option = req.query.option;

  let results;
  try {
    let cursor = await db.collection("Groups").find({ groupname: option });
    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.get("/GetAllGroups", async (req, res) => {
  let db = await connect();
  let results;
  let user = req.query.user.username;

  try {
    let cursor = await db.collection("Groups").find({ admin: { $eq: user } });
    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.get("/groups", async (req, res) => {
  let db = await connect();
  let user = req.query.user;
  let searchterm = req.query.search;
  let results;

  if (searchterm === "") {
    try {
      let cursor = await db.collection("Groups").find({ admin: { $ne: user } });
      results = await cursor.toArray();
    } catch (e) {
      console.log(e);
    }
  } else {
    try {
      let cursor = await db.collection("Groups").find({
        $and: [{ admin: { $ne: user } }, { groupname: new RegExp(searchterm) }],
      });
      results = await cursor.toArray();
    } catch (e) {
      console.log(e);
    }
  }
  res.json(results);
});
app.get("/group", async (req, res) => {
  let db = await connect();
  let user = req.query.user.username;
  let results;

  try {
    let cursor = await db.collection("Groups").find({ admin: user });

    results = await cursor.toArray();
  } catch (e) {
    console.log(e);
  }
  res.json(results);
});
app.get("/groupOption", async (req, res) => {
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

app.delete("/DeleteGroup", async (req, res) => {
  let db = await connect();
  let group = req.query.group;

  try {
    await db.collection("Groups").deleteOne({ groupname: group });
  } catch (e) {
    console.log(e);
  }

  res.json();
});

app.put("/ChangeCompanyName", async (req, res) => {
  let db = await connect();

  let pick = req.body.params.pickoption;
  let newCompanyName = req.body.params.company;
  try {
    await db
      .collection("Groups")
      .updateOne(
        { groupname: pick },
        { $set: { companyname: newCompanyName } }
      );
  } catch (e) {
    console.log(e);
  }

  res.json(pick);
});
app.put("/ChangeGroupJoinType", async (req, res) => {
  let db = await connect();

  let pick = req.body.params.pickoption;
  let groupjoin = req.body.params.groupjoin;
  try {
    await db
      .collection("Groups")
      .updateOne({ groupname: pick }, { $set: { groupjoin: groupjoin } });
  } catch (e) {
    console.log(e);
  }

  res.json(pick);
});
app.put("/joingroup", async (req, res) => {
  let db = await connect();
  let groupname = req.body.groupname;
  let username = req.body.username;
  let doc = {
    username: username,
    role: "Member",
    notes: "",
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
app.put("/CompleteTask", async (req, res) => {
  let db = await connect();
  let groupname = req.body.params.pickoption;
  let taskData = req.body.params.taskData;

  let doc = {
    taskname: taskData.taskname,
    deadline: taskData.deadline,
    forUser: taskData.forUser,
  };

  try {
    await db
      .collection("Groups")
      .updateOne({ groupname: groupname }, { $push: { completedTasks: doc } });
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
    admin: user,
    project: {
      description: "",
      information: "",
    },
    completedTasks: [],
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

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
});
