const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");

const PORT = 8000;
const app = express();

//Connection with mongoDb
mongoose
  .connect("mongodb://127.0.0.1:27017/sample-user-data")
  .then(() => console.log("MongoDB connected :)"))
  .catch((err) => console.log("Mongo error", err));

//Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
    },
    jobTitle: {
      type: String,
    },
  },
  { timestamps: true }
);

//Model
const User = mongoose.model("user", userSchema);

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Welcome to REST API basics!");
});

app.get("/users", async (req, res) => {
  const allDBUsers = await User.find({});
  const html = `
      <ul>
          ${allDBUsers
            .map((user) => `<li>${user.firstName} ${user.lastName}</li>`)
            .join("")}
      </ul>
      `;
  res.send(html);
});

//REST API
app.get("/api/users", async (req, res) => {
  const allDBUsers = await User.find({});
  return res.json(allDBUsers);
});

//Dynamic route
app
  .route("/api/users/:id")
  .get(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "user not found!" });
    return res.json(user);
  })
  .patch(async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { lastName: "changed" });
    return res.json({ msg: "success" });
  })
  .delete(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ msg: "success" });
  });

app.post("/api/users", async (req, res) => {
  const body = req.body;
  if (
    !body ||
    !body.firstName ||
    !body.lastName ||
    !body.email ||
    !body.gender ||
    !body.jobTitle
  ) {
    return res.status(400).json({ msg: "all fields are req..!" });
  }
  const result = await User.create({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    gender: body.gender,
    jobTitle: body.jobTitle,
  });

  return res.status(201).json({ msg: "success" });
});

app.listen(PORT, () => {
  console.log(`Server runs on PORT: ${PORT}`);
});
