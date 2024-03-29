const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const express = require("express");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const router = express.Router();

// Login
router.post("/", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  //Dont send 404-not found here
  //cause we dont want to tell the user wrong email or password
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();
  res.send(token);
});

function validateLogin(req) {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .min(5)
      .max(50),
    password: Joi.string()
      .required()
      .min(5)
      .max(50)
  });

  return schema.validate(req);
}

module.exports = router;
