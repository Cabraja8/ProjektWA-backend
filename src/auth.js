import mongo from "mongodb";
import connect from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
let authentication = async () => {
  let db = await connect();
  await db.collection("users").createIndex({ email: 50 }, { unique: true });
};
authentication();
export default {
  async registerUser(userData) {
    let db = await connect();
    console.log("tu smo", userData);
    let doc = {
      email: userData.email,
      password: await bcrypt.hash(userData.password, 8),
    };
    let existingUser = db
      .collection("users")
      .findOne({ email: userData.email });

    try {
      let result = await db.collection("users").insertOne(doc);
      if (result && result.insertedId) {
        return result;
      }
    } catch (e) {
      if (e.name == "MongoError" && e.code == 11000) {
        //doesn't work idk why
        throw new Error("Korisnik već postoji!");
      }
    }
    if (existingUser) {
      console.log("korisnik već postoji");
    }
  },
  async authenticateUser(email, password) {
    let db = await connect();
    let user = await db.collection("users").findOne({ email: email });

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      delete user.password;
      let token = jwt.sign(user, process.env.JWT_SECRET, {
        algorithm: "HS512",
        expiresIn: "1 week",
      });
      return {
        token,
        email: user.email,
      };
    } else {
      throw new Error("cannot authenticate");
    }
  },
  verify(req, res, next) {
    try {
      let authorization = req.headers.authorization.split(" ");
      let type = authorization[0];
      let token = authorization[1];

      if (type !== "Bearer") {
        return res.status(401).send();
      } else {
        req.jwt = jwt.verify(token, process.env.JWT_SECRET);
        return next();
      }
    } catch (e) {
      return res.status(403).send();
    }
  },
};
