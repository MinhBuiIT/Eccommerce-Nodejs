const redis = require('redis');

class RedisPubSubService {
  constructor() {
    this.pub = redis.createClient();

    this.sub = redis.createClient();
    // Connect to Redis when the service is initialized
    this.connect();
  }
  async connect() {
    try {
      // Connect the publisher client
      await this.pub.connect();
      console.log('Publisher connected to Redis');

      // Connect the subscriber client
      await this.sub.connect();
      console.log('Subscriber connected to Redis');
    } catch (err) {
      console.error('Error connecting to Redis:', err);
    }
  }
  async publish(channel, message) {
    try {
      let result = 0;
      while (result === 0) {
        result = await this.pub.publish(channel, JSON.stringify(message));
        console.log('Result', result);
      }

      return result;
    } catch (err) {
      console.log(err);
    }
  }

  async subcribe(channel, callback) {
    await this.sub.subscribe(channel, (message, subchannel) => {
      if (subchannel === channel) {
        callback(message);
      }
    });
    // this.sub.on('message', (subchannel, message) => {
    //   if (subchannel === channel) {
    //     callback(message);
    //   }
    // });
  }
}
module.exports = new RedisPubSubService();
