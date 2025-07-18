const Redis = require("redis");

class RedisPubSubService {
  constructor() {
    this.subscriber = Redis.createClient();
    this.publisher = Redis.createClient();
  }

  publish(channel, message) {
    return new Promise((resolve, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(message);
        }
      });
    });
  }

  subscribe(channel, callback) {
    this.subscriber.subscribe(channel);
    this.subscriber.on("message", (subscriberChannel, message) => {
      if (channel === subscriberChannel) {
        callback(channel, message);
      }
    });
  }
}

module.exports = new RedisPubSubService();
