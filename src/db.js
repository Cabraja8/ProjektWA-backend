import moongo, { MongoAPIError } from "mongodb";

let connection_string =
  "mongodb+srv://ivancabi:<xcxOsXEosX92d1h3>@projektwa.aztnwwk.mongodb.net/test";

let client = new MongoAPIError.MongoClient(connection_string, {
  newUrlParser: true,
  useUnifiedTopology: true,
});

export default () => {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        reject("došlo je do greške" + err);
      } else {
        console.log("uspješno spajanje");
      }
    });
  });
};
