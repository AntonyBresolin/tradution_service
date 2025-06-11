import http from "node:http";
import app from "./app.js"

const error = (err) => {
  console.error(`An error has occurred on start server\n ${err.message}`);
  throw err;
};

const listening = () => {
  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 4040;
  console.log(`Server running on http://${host}:${port}`);
  console.log(`Access the API at: http://localhost:${port}`);
};

const server = http.createServer(app);
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 4040;
server.listen(port, host);
server.on("error", error);
server.on("listening", listening);
