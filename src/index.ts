import { Server } from './server/server';

let server: Server = new Server(true);
server.start()
.then((port: number) => {
  console.log('server is listening on port ' + port);
})
.catch((err) => {
  console.log(err);
});
