const amqp = require("amqplib");

const runConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const chanel = await connection.createChannel();

    const queueName = "test-topic";
    await chanel.assertQueue(queueName, {
      durable: true,
    });

    // send messages to consumer chanel
    chanel.consume(
      queueName,
      (messages) => {
        console.log(`Received: ${messages.content.toString()}`);
      },
      {
        noAck: true,
      }
    );
  } catch (error) {
    console.error(error);
  }
};

runConsumer().catch(console.error);
