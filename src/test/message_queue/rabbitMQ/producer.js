const amqp = require("amqplib");
const messages = "Hello, RabbitMQ";

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const chanel = await connection.createChannel();

    const queueName = "test-topic";
    await chanel.assertQueue(queueName, {
      durable: true,
    });

    // send messages to consumer chanel
    chanel.sendToQueue(queueName, Buffer.from(messages));
    console.log(`message sent: `, messages);
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(error);
  }
};

runProducer().catch(console.error);
