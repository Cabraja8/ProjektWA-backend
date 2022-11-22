import mongo from "mongodb";
import connect from "./db.js";
import bcrypt from "bcrypt";
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
    } catch (err) {
      if (err.name == "MongoError" && err.code == 11000) {
        throw new Error("Korisnik već postoji!");
      }
    }
  },
};
