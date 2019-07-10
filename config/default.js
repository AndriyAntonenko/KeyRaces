module.exports = {
  PORT: process.env.PORT || 3000,
  mongoose: {
    url: "mongodb://andrii:qwe123@ds347467.mlab.com:47467/binary-races",
    options: {
      useNewUrlParser: true,
      promiseLibrary: global.Promise,
      poolSize: 5,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000
    }
  },
  tokens: {
    tokenSecret: "doqnf12o3g4o35noi319012fjbnjas"
  },
  raceData: {
    raceTimeInSeconds: 90,
    waitTimeInSeconds: 15
  }
};
