/* eslint-disable class-methods-use-this */
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

module.exports = class Message {
  getJoke(jokeNumber) {
    return new Joke().getJoke(jokeNumber);
  }

  getRaceInfo(players) {
    return new RaceInfoMessage(players);
  }
};
