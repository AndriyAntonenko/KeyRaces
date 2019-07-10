/* eslint-disable no-use-before-define */
/* eslint-disable class-methods-use-this */
const config = require("config");
const { ObjectId } = require("mongoose").Types.ObjectId;

const Race = require("../../../models/race.model");

const raceTime = config.get("raceData.raceTimeInSeconds");

class Message {
  getJoke(jokeNumber) {
    return new Joke().getJoke(jokeNumber);
  }

  getRaceInfo(players) {
    return new RaceInfoMessage(players);
  }
}

class RaceInfoMessage {
  constructor(players) {
    this.players = players;
  }

  createMessage() {
    let message = `Сейчас в гонке лидирует ${this.players[0].login}`;

    if (this.players[1]) {
      message += `, сразу за ним следует ${this.players[1].login}`;
    }

    if (this.players[2]) {
      message += ` и третьим идёт ${this.players[2].login}.`;
    }

    return message;
  }

  getRaceResults() {
    let message = "Гонка завершена! Места распределились следующим образом: ";

    this.players.forEach((p, i) => {
      message += `\n - ${i + 1} место: ${p.login}`;
    });

    return message;
  }
}

class Joke {
  constructor() {
    this.jokes = [
      "Вчера лежачий полицейский догнал эстонского гонщика.",
      "И было у старика Шумахера три сына: двое гонщиков, а третий — водитель маршрутки.",
      "Журналист спрашивает гонщика—победителя: — Как Вам удалось обойти столь опытных и именитых соперников? — Да просто тормоза отказали..."
    ];
  }

  getJoke(jokeNumber) {
    if (jokeNumber >= this.jokes.length) {
      // eslint-disable-next-line no-param-reassign
      jokeNumber %= this.jokes.length;
    }

    return this.jokes[jokeNumber];
  }
}

exports.message = async function(io, socket, { raceId, time, toFinish }) {
  socket.join(`commentator-${raceId}`);

  const race = await Race.aggregate([
    { $match: { _id: ObjectId(raceId) } },
    { $unwind: "$racers" },
    {
      $lookup: {
        from: "users",
        localField: "racers",
        foreignField: "_id",
        as: "racerObjects"
      }
    },
    { $unwind: "$racers" },
    {
      $group: {
        _id: "$_id",
        racers: { $push: "$racers" },
        racerObjects: { $push: "$racerObjects" }
      }
    }
  ]);

  const raceData = {
    message: `Всем привет, с вами ваш любимый комментатор - Эскейп Энтерович. Сегодня мы
    с вами наблюдаем интерестнейшую гонку в которой учавствуют: `
  };

  if (!time) {
    race[0].racerObjects
      .map(r => r[0])
      .forEach(player => {
        raceData.message += `\n  - ${player.login}`;
      });
  }

  const proxyForMessage = new Proxy(raceData, {
    get(tartget, prop) {
      if (prop !== "message" || time === 0) {
        return tartget[prop];
      }

      if (toFinish === 30) {
        return `${socket.user.login} уже через 30 символов будет на финише`;
      }

      if (time >= raceTime) {
        const players = race[0].racerObjects.map(r => r[0]);
        return new Message().getRaceInfo(players).getRaceResults();
      }

      if (toFinish === 0) {
        return `${socket.user.login} уже финишировал! Поздравим его!`;
      }

      if (time % 30 === 0) {
        const players = race[0].racerObjects.map(r => r[0]);

        return new Message().getRaceInfo(players).createMessage();
      }

      return new Message().getJoke(time / 15);
    }
  });

  io.of(this.nmsp)
    .to(`commentator-${raceId}`)
    .emit("message", {
      message: proxyForMessage.message
    });

  if (time >= raceTime) {
    io.of(this.nmsp)
      .to(`commentator-${raceId}`)
      .emit("finish");
  }
};
