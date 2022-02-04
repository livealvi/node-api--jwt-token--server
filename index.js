require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//mongodb - uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.amhkf.mongodb.net/${process.env.DB_USER}?retryWrites=true&w=majority`;

//firebase - admin token
var admin = require("firebase-admin");
var serviceAccount = require("./configs/burj-c0be9-firebase-adminsdk-aier2-4be0d9562e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
//firebase - admin token

//mongodb - CURD
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db("bruj").collection("booking");
  // perform actions on the collection object
  console.log("DB Connected!");

  //read
  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      // idToken comes from the client app
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if (tokenEmail == req.query.email) {
            bookings
              .find({ email: req.query.email })
              .toArray((error, documents) => {
                res.status(200).send(documents);
              });
          } else {
            res.status(401).send("unauthorized access");
          }
        })
        .catch((error) => {
          res.status(401).send("unauthorized access");
        });
    } else {
      res.status(401).send("unauthorized access");
    }
  });

  //insert
  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.port || 8080;
app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
