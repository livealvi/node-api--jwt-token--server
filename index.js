const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://bruj:bruj121@cluster0.amhkf.mongodb.net/bruj?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db("bruj").collection("booking");
  // perform actions on the collection object
  console.log("DB Connected!");

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newBooking);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.port || 8080;
app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
