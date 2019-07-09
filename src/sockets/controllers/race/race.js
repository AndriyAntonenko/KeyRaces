/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const Race = require("../../../models/race.model");

const raceTimeInSeconds = 45;
let playersInGame = [];
const timers = {};

exports.startNewRace = async function(io, socket, { raceId }) {
  const newRace = await Race.findById(raceId).populate("user");
  console.log(newRace);

  socket.user.startTime = newRace.createdAt;
  console.log(socket.user.startTime);
  console.log(this.nmsp);

  if (!newRace) {
    throw new Error("Race not found");
  }

  socket.join(`race-${raceId}`);
  playersInGame = [...playersInGame, socket.user];

  if (!timers[raceId]) {
    const timer = setTimeout(async () => {
      let players = [...newRace.racers];

      players = playersInGame
        .filter(player => {
          for (let i = 0; i < players.length; i++) {
            if (`${player._id}` === `${players[i]._id}`) {
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

      console.log(players.map(p => `${p._id}`));

      await Race.findByIdAndUpdate(raceId, {
        isActive: false,
        racers: players.map(p => `${p._id}`)
      });
      console.log(players);

      io.of(this.nmsp)
        .to(`race-${raceId}`)
        .emit("stop", { playersInGame: players });

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
  playersInGame.forEach(player => {
    if (userLogin === player.login) {
      player.progress = correctSymbols;
      player.time = new Date() - socket.user.startTime;
    }
  });

  socket.broadcast
    .to(`race-${raceId}`)
    .emit("get-enemy-progress", { userLogin, correctSymbols });
};

exports.disconnect = async function(io, socket) {
  for (let i = 0; i < playersInGame.length; i++) {
    if (playersInGame[i].login === socket.user.login) {
      playersInGame.splice(i, 1);
      break;
    }
  }
  console.log(`${socket.user.login} has been disconnected`);
};
