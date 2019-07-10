/* eslint-disable no-console */
/* eslint-disable no-plusplus */
const config = require("config");
const dayjs = require("dayjs");

const Race = require("../../../models/race.model");

const waitTimeInSeconds = config.get("raceData.waitTimeInSeconds");
let waitPlayers = [];
let roomName;

exports.wait = function(io, socket) {
  if (!waitPlayers.length) {
    const startTime = dayjs(new Date()).add(waitTimeInSeconds, "second");
    let secondsToStart = waitTimeInSeconds;
    roomName = `wait-${socket.user.id}`;

    const timer = setInterval(() => {
      const now = new Date();
      secondsToStart--;

      io.of(this.nmsp)
        .to(roomName)
        .emit("timer", { secondsToStart });

      if (startTime <= now) {
        clearInterval(timer);
        Race.create({
          isActive: true,
          racers: waitPlayers.map(p => p._id)
        }).then(newRace => {
          io.of(this.nmsp)
            .to(roomName)
            .emit("start", { players: waitPlayers, raceId: newRace._id });

          waitPlayers = [];
        });

        io.of(this.nmsp)
          .in(roomName)
          .clients((err, clients) => {
            if (err) {
              throw err;
            }

            clients.forEach(socketId => {
              io.sockets.sockets[socketId.slice(`${this.nmsp}#`.length)].leave(
                roomName
              );
            });
          });
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
    socket.join(roomName);
    waitPlayers = [...waitPlayers, socket.user];
    Race.count().then(raceNumber => {
      socket.emit("join-to-game", { raceNumber, login: socket.user.login });
    });
  }
};

exports.disconnect = async function(io, socket) {
  for (let i = 0; i < waitPlayers.length; i++) {
    if (waitPlayers[i].login === socket.user.login) {
      socket.leave(roomName);
      waitPlayers.splice(i, 1);
      break;
    }
  }
  console.log(`${socket.user.login} has been disconnected`);
};
