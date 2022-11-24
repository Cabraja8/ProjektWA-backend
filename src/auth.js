import mongo from "mongodb";
import connect from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
let authentication = async () => {
  let db = await connect();
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
};
authentication();
export default {
  async registerUser(userData) {
    let db = await connect();

    let doc = {
      email: userData.email,
      password: await bcrypt.hash(userData.password, 8),
    };

    try {
      let result = await db.collection("users").insertOne(doc);
      if (result && result.insertedId) {
        return result.insertedId;
      }
    } catch (e) {
      if (e.name == "MongoError" && e.code == 11000) {
        throw new Error("Korisnik već postoji!");
      }
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
      let token = jwt.sign(user, "tajna", {
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
};
