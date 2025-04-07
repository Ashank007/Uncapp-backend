import {server} from "./app.js";
server.listen(5200, '0.0.0.0', () => {
  console.log('Server running on port 5200');
});
