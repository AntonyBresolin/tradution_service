import amqp from "amqplib";
import colors from "colors";

export default async (queue, exchange, routingKey, callback) => {
  const RABBITMQ = process.env.RABBITMQ;
  const MAX_RETRIES = parseInt(process.env.MAX_RETRIES);

  try {
    const connection = await amqp.connect(RABBITMQ);
    const channel = await connection.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });

    await channel.assertQueue(queue, { durable: true });
    await channel.assertQueue(`${queue}_dlq`, { durable: true });

    await channel.bindQueue(queue, exchange, routingKey);
    await channel.bindQueue(`${queue}_dlq`, exchange, "dlq");

    await channel.consume(
      queue,
      (message) => {
        const content = message.content.toString();
        const retries = message.properties.headers?.["x-retries"] || 0;

        try {
          console.log(colors.green("==> Mensagem recebida:"), content);
          console.log(colors.green("===> Quantidade de tentativas:"), retries);

          // forçando um erro para teste
          // throw new Error("Erro ao processar a mensagem!");

          callback(JSON.parse(content));
          console.log(colors.green("====> Mensagem processada!"));
        } catch (err) {
          if (retries < MAX_RETRIES) {
            console.log(colors.yellow("====> Realizando outra tentativa!"));
            channel.sendToQueue(queue, Buffer.from(content), {
              headers: { "x-retries": retries + 1},
              persistent: true,
            });
          } else {
            console.log(colors.red("====> Mensagem enviada para DLQ!"));
            channel.publish(exchange, "dlq", Buffer.from(content), {
              headers: { "x-retries": retries },
              persistent: true,
            });
          }
        } finally {
          channel.ack(message);
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error(err);
  }
}
