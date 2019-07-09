/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const socketIO = require("socket.io");

const jwtVerify = require("./middlewares/jwt.verify");
const errorHandler = require("./middlewares/errorHandler");

const waitInstructions = require("./controllers/wait/instruction");
const raceInstruction = require("./controllers/race/instruction");

module.exports = server => {
  const io = socketIO(server, {
    handlePreflightRequest(req, res) {
      const headers = {
        "Access-Control-Allow-Headers": "authorization",
        "Access-Control-Allow-Origin": req.headers.origin,
        "Access-Control-Allow-Credentials": true
      };
      res.writeHead(200, headers);
      res.end();
    }
  });

  io.use(jwtVerify).on("connection", socket => {
    console.log(`${socket.user.login} has been connected`);
  });

  io.of("/wait")
    .use(jwtVerify)
    .on("connection", socket => {
      waitInstructions.forEach(instruction => {
        console.log(instruction.eventName);

        socket.on(
          instruction.eventName,
          errorHandler(socket, io, "/wait", instruction)
        );
      });
    });

  io.of("/race")
    .use(jwtVerify)
    .on("connection", socket => {
      raceInstruction.forEach(instruction => {
        console.log(instruction.eventName);

        socket.on(
          instruction.eventName,
          errorHandler(socket, io, "/race", instruction)
        );
      });
    });
};
