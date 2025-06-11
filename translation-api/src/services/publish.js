import amqp from "amqplib";
import { version } from "mongoose";
import { v4 } from "uuid";

const exchange = "message_translation_exchange";
const routingKey = "message";

export default async (data) => {
  let connection;

  try {
    connection = await amqp.connect(process.env.RABBITMQ);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, "direct", { durable: true });
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify({
      eventType: "MessageSendToQueue",
      version: "1.0",
      producer: "api",
      timestamp: new Date(),
      correlationId: v4(),
      data,
    })));

    await channel.close();
  } catch (err) {
    throw new Error(err.message);
  } finally {
    if (connection) await connection.close();
  }
}
