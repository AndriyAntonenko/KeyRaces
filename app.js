const http = require("http");

const express = require("express");
const config = require("config");

require("./src/libs/mongoose");

const app = express();
const server = http.createServer(app);

const socket = require("./src/sockets");

socket(server);

const port = config.get("PORT");

const pagesRouter = require("./src/routes/static.pages");
const authRouter = require("./src/routes/auth");
const textRouter = require("./src/routes/textes");

const middlewares = require("./src/middlewares");
const passport = require("./src/libs/passport.config");

const errorHandler = require("./src/middlewares/errorHandler");

middlewares(app);
app.use(passport.initialize());

app.use("/", pagesRouter);
app.use("/auth", authRouter);
app.use("/text", textRouter);

app.use(express.static("public"));

errorHandler(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});
