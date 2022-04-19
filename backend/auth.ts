import bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import passport from "passport";
import { User } from "../src/models/user";
import { getUserBy, getUserById } from "./database";

const LocalStrategy = require("passport-local").Strategy;
const router = express.Router();

// configure passport for local strategy
passport.use(
  new LocalStrategy(function (username: string, password: string, done: Function) {
    const user = getUserBy("username", username);

    const failureMessage = "Incorrect username or password.";
    if (!user) {
      return done(null, false, { message: failureMessage });
    }

    // validate password
    if (!bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: failureMessage });
    }

    return done(null, user);
  })
);

passport.serializeUser(function (user: User, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id: string, done) {
  const user = getUserById(id);
  done(null, user);
});

router.get("/redirect", (req, res) => {
  const target = req.params.target;
  if (!target) {
    res.status(400);
    return;
  }
  let url;
  switch (target) {
    case "google":
      url = "https://www.google.com";
      break;
    case "yahoo":
      url = "https://yahoo.com";
      break;
    case "bing":
      url = "https://bing.com";
      break;
    default:
      res.status(404);
      return;
  }
  res.redirect(url);
});

// authentication routes
router.post("/login", passport.authenticate("local"), (req: Request, res: Response): void => {
  if (req.body.remember) {
    req.session!.cookie.maxAge = 24 * 60 * 60 * 1000 * 30; // Expire in 30 days
  } else {
    req.session!.cookie.expires = undefined;
  }

  res.send({ user: req.user });
});

router.post("/logout", (req: Request, res: Response): void => {
  res.clearCookie("connect.sid");
  req.logout();
  req.session!.destroy(function (err) {
    res.redirect("/");
  });
});

router.get("/checkAuth", (req, res) => {
  /* istanbul ignore next */
  if (!req.user) {
    res.status(401).json({ error: "User is unauthorized" });
  } else {
    res.status(200).json({ user: req.user });
  }
});

export default router;
