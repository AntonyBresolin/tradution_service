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
      async (message) => {
        const content = message.content.toString();
        const retries = message.properties.headers?.["x-retries"] || 0;

        try {
          console.log(colors.green("==> Mensagem recebida:"), content);
          console.log(colors.green("===> Quantidade de tentativas:"), retries);

          await callback(JSON.parse(content));
          console.log(colors.green("====> Mensagem processada!"));
        } catch (err) {
          console.log(colors.red("====> Erro ao processar mensagem:"), err.message);
          
          const shouldRetry = !err.message.includes('Validation error') && 
                             !err.message.includes('Dados incompletos') &&
                             !err.message.includes('required') &&
                             retries < MAX_RETRIES;
          
          if (shouldRetry) {
            console.log(colors.yellow(`====> Realizando tentativa ${retries + 1}/${MAX_RETRIES}!`));
            
            const delay = Math.min(1000 * Math.pow(2, retries), 30000);
            setTimeout(() => {
              channel.sendToQueue(queue, Buffer.from(content), {
                headers: { "x-retries": retries + 1},
                persistent: true,
              });
            }, delay);
          } else {
            console.log(colors.red("====> Mensagem enviada para DLQ!"));
            console.log(colors.red("====> Motivo:"), shouldRetry ? "Máximo de tentativas excedido" : "Erro não recuperável");
            
            channel.publish(exchange, "dlq", Buffer.from(content), {
              headers: { 
                "x-retries": retries,
                "x-error": err.message,
                "x-error-type": shouldRetry ? "max-retries" : "validation-error"
              },
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
