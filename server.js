const app = require("./src/app");

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log("connected with port:", PORT);
});

process.on("SIGINT", () => {
  server.close(() => console.log("disconnected with port:", PORT));
});
