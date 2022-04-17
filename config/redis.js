const redis = require("redis");

let Redis = redis.createClient({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
});

Redis.select(process.env.REDIS_DB);
Redis.on("connect", () => {
  console.log(`Connected to Redis @ ${Redis.address} `.bgYellow.black.bold);
}).on("error", err => {
  console.log("Redis Error ".red + err);
});

// Drop All Redis
if (JSON.parse(process.env.DROP_DB)) {
  Redis.flushdb(function (err, succeeded) {
    console.log("Redis Drop0All:".bgGreen.white.bold, succeeded); // will be true if successfull
  });
}

module.exports = Redis;
