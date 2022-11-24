import mongo from "mongodb";

let connection_string =
  "mongodb+srv://ivancabi:xcxOsXEosX92d1h3@projektwa.aztnwwk.mongodb.net/test";

let client = new mongo.MongoClient(connection_string, {
  usenewUrlParser: true,
  useUnifiedTopology: true,
});

let db = null;
export default () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
    }
    client.connect((e) => {
      if (e) {
        reject("došlo je do greške " + e);
      } else {
        console.log("uspješno spajanje");
        db = client.db("ProjectManager");
        resolve(db);
      }
    });
  });
};
