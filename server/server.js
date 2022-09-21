const express = require("express");
const next = require("next");
const mongoose = require("mongoose");
const User = require("./models/User");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require("dotenv").config();

const dev = process.env.NODE_ENV !== "production";
const MONGO_URL = process.env.MONGO_URL_TEST;

const port = process.env.PORT || 8000;
const ROOT_URL = `http://localhost:${port}`;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  mongoose.connect(MONGO_URL);

  const ses = {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000,
      domain: "localhost",
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      ttl: 14 * 24 * 60 * 60,
    }),
  };

  const server = express();

  server.use(session(ses));

  server.get("/", async (req, res) => {
    req.session.foo = "bar";
    const user = await User.findOne({ slug: "team-builder-book" });
    app.render(req, res, "/", { user });
  });

  server.get("*", (req, res) => handle(req, res));

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on ${ROOT_URL}`);
  });
});
