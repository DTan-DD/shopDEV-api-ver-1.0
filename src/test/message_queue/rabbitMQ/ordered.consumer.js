"use strict";
const amqp = require("amqplib");

async function consumerOrderedMessage() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queueName = "ordered-queue-message";
  await channel.assertQueue(queueName, {
    durable: true,
  });

  // Set prefetch to 1 to ensure only one ack at a time
  channel.prefetch(1);

  channel.consume(queueName, (msg) => {
    const message = msg.content.toString();

    setTimeout(() => {
      console.log("processed: ", message);
      channel.ack(msg);
    }, Math.random() * 1000);
  });
}

consumerOrderedMessage().catch((err) => console.error(err));
