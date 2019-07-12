/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const config = require("config");

const Race = require("../../../models/race.model");

const raceTimeInSeconds = config.get("raceData.raceTimeInSeconds");
const playersInGame = {};
const timers = {};

exports.startNewRace = async function(io, socket, { raceId }) {
  const newRace = await Race.findById(raceId).populate("user");
  socket.user.startTime = newRace.createdAt;

  if (!newRace) throw new Error("Race not found");

  if (!playersInGame[raceId]) playersInGame[raceId] = [];

  socket.join(`race-${raceId}`);
  playersInGame[raceId] = [...playersInGame[raceId], socket.user];

  if (!timers[raceId]) {
    const timer = setTimeout(async () => {
      await Race.findByIdAndUpdate(raceId, {
        isActive: false,
        racers: playersInGame[raceId].map(p => `${p._id}`)
      });

      io.of(this.nmsp)
        .to(`race-${raceId}`)
        .emit("stop", { playersInGame: playersInGame[raceId] });

      io.of(this.nmsp)
        .in(`race-${raceId}`)
        .clients((err, clients) => {
          clients.forEach(socketId => {
            io.sockets.sockets[socketId.slice(`${this.nmsp}#`.length)].leave(
              `race-${raceId}`
            );
          });
        });
    }, raceTimeInSeconds * 1000);

    timers[raceId] = timer;
  }
};

exports.getProgress = async function(
  io,
  socket,
  { userLogin, correctSymbols, raceId }
) {
  playersInGame[raceId].forEach(player => {
    if (userLogin === player.login) {
      player.progress = correctSymbols;
      player.time = new Date() - socket.user.startTime;
    }
  });

  playersInGame[raceId] = playersInGame[raceId].sort((a, b) => {
    if (!(b.progress - a.progress)) {
      return a.time - b.time;
    }

    return b.progress - a.progress;
  });
  await Race.findByIdAndUpdate(raceId, {
    racers: playersInGame[raceId].map(p => `${p._id}`)
  });

  socket.broadcast.to(`race-${raceId}`).emit("get-enemy-progress", {
    userLogin,
    correctSymbols,
    players: playersInGame[raceId]
  });
};

exports.disconnect = async function(io, socket) {
  Object.keys(playersInGame).forEach(key => {
    for (let i = 0; i < playersInGame[key].length; i++) {
      if (playersInGame[key][i].login === socket.user.login) {
        socket.broadcast
          .to(`race-${key}`)
          .emit("crash", { login: socket.user.login });

        playersInGame[key].splice(i, 1);
        break;
      }
    }
  });
  console.log(`${socket.user.login} has been disconnected`);
};
