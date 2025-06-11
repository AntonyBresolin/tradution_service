import dotenv from "dotenv";
import connection from "./services/connection.js";

dotenv.config();

const queue = "message_translation";
const exchange = "message_translation_exchange";
const routingKey = "message";

connection(queue, exchange, routingKey, (task) => {
  fetch(task.data.callback.href, {
    method: task.data.callback.method,
  });
});
