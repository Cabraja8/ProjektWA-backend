const { MongoClient } = require("mongodb");

let connection_string =
  "mongodb+srv://ivancabi:<xcxOsXEosX92d1h3>@projektwa.aztnwwk.mongodb.net/test";

let client = new mongo.MongoClient(connection_string, {
  usenewUrlParser: true,
  useUnifiedTopology: true,
});

export default () => {
  return new Promise((resolve, reject) => {
    if (db && client.isConnected()) {
      resolve(db);
    }
    client.connect((err) => {
      if (err) {
        reject("došlo je do greške" + err);
      } else {
        console.log("uspješno spajanje");
        let db = client.db("ProjectManager");
        resolve(db);
      }
    });
  });
};
