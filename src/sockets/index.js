/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const socketIO = require("socket.io");
const dayjs = require("dayjs");

const jwtVerify = require("./middlewares/jwt.verify");

let waitPlayers = [];
let playersInGame = [];
const waitTimeInSeconds = 15;
const raceTimeInSeconds = 15;

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

  let startTime;
  let secondsToStart;
  let raceNumber = 0;
  let raceIsNow = false;

  const waitNameSpace = io
    .of("/wait")
    .use(jwtVerify)
    .on("connection", async socket => {
      if (!waitPlayers.length) {
        startTime = dayjs(new Date()).add(waitTimeInSeconds, "second");
        secondsToStart = waitTimeInSeconds;
        const timer = setInterval(() => {
          const now = new Date();
          secondsToStart--;

          waitNameSpace
            .to(`wait-${raceNumber}`)
            .emit("timer", { secondsToStart });
          if (startTime <= now) {
            clearInterval(timer);
            waitNameSpace
              .to(`wait-${raceNumber}`)
              .emit("start", { players: waitPlayers });

            waitPlayers = [];
            waitNameSpace.in(`wait-${raceNumber}`).clients((err, clients) => {
              clients.forEach(socketId => {
                io.sockets.sockets[socketId.slice("/wait#".length)].leave(
                  `wait-${raceNumber}`
                );
              });
            });

            if (raceIsNow) ++raceNumber;
            raceIsNow = true;
          }
        }, 1000);
      }
      let userIsExist = false;
      waitPlayers.forEach(player => {
        if (`${player._id}` === `${socket.user._id}`) {
          userIsExist = true;
        }
      });
      if (!userIsExist) {
        socket.join(`wait-${raceNumber}`);
        waitPlayers.push(socket.user);
      }

      socket.emit("join-to-game", { raceNumber, login: socket.user.login });

      socket.on("disconnect", () => {
        for (let i = 0; i < waitPlayers.length; i++) {
          if (waitPlayers[i].login === socket.user.login) {
            waitPlayers.splice(i, 1);
            break;
          }
        }
        console.log(`${socket.user.login} has been disconnected`);
      });
    });

  const timers = {};
  const raceNamespace = io
    .of("/race")
    .use(jwtVerify)
    .on("connection", socket => {
      if (!playersInGame.length) {
        if (raceIsNow) {
          ++raceNumber;
        }
      }

      let userIsExist = false;
      playersInGame.forEach(player => {
        if (`${player._id}` === `${socket.user._id}`) {
          userIsExist = true;
        }
      });
      if (!userIsExist) {
        socket.join(raceNumber, () => {
          playersInGame.push(socket.user);

          const roomName = Object.keys(socket.rooms)[0];

          const start = new Date();
          // const end = dayjs(start).add(raceTimeInSeconds, "second");

          socket.on("get-progress", data => {
            playersInGame.forEach(player => {
              if (data.userLogin === player.login) {
                player.progress = data.correctSymbols;
                player.time = new Date() - start;
              }
            });

            raceNamespace.in(roomName).clients((err, clients) => {
              let clientsCount = 0;

              clients.forEach(() => ++clientsCount);

              if (clientsCount > 1) {
                socket.broadcast.to(roomName).emit("get-enemy-progress", data);
              }
            });
          });
          if (!timers[roomName]) {
            const timer = setTimeout(() => {
              const ids = [];
              raceNamespace.in(roomName).clients((err, clients) => {
                clients.forEach(socketId => {
                  ids.push(
                    io.sockets.sockets[socketId.slice("/race#".length)].user._id
                  );
                });

                playersInGame = playersInGame
                  .filter(player => {
                    console.log(ids);
                    for (let i = 0; i < ids.length; i++) {
                      if (`${player._id}` === `${ids[i]}`) {
                        return true;
                      }
                    }
                    return false;
                  })
                  .sort((a, b) => {
                    if (!(b.progress - a.progress)) {
                      return a.time - b.time;
                    }

                    return b.progress - a.progress;
                  });
                raceNamespace.to(roomName).emit("stop", { playersInGame });
                playersInGame = [];
                // eslint-disable-next-line no-shadow
                raceNamespace.in(roomName).clients((err, clients) => {
                  clients.forEach(socketId => {
                    io.sockets.sockets[socketId.slice("/race#".length)].leave(
                      roomName
                    );
                  });
                });
                raceIsNow = false;
              });
            }, raceTimeInSeconds * 1000);

            timers[roomName] = timer;
          }
        });
      }

      socket.on("disconnect", () => {
        for (let i = 0; i < playersInGame.length; i++) {
          if (playersInGame[i].login === socket.user.login) {
            playersInGame.splice(i, 1);
            break;
          }
        }
        console.log(`${socket.user.login} has been disconnected`);
      });
    });
};
