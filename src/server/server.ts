import * as http from 'http';
import { App } from './app';
export { Server };

class Server {
  private http: http.Server;
  private port: number | string;
  private app: App;

  constructor (logging: boolean) {
    this.port = process.env.PORT || 10000;
    this.app = new App(true);
    this.http = http.createServer(this.app.getExpress());
    // Register handler for Server force close.
    this.onClose();
  }

  public start () : Promise<number> {
    return new Promise((resolve, reject) => {
      // Start app first.
      this.app.start()
      .then(() => {
        // When connected, start listen server.
        this.http.listen(this.port, (err: any) => {
          // If the listen server has an error.
          if (err) reject(err);
          // Send back port the server is using.
          resolve(this.http.address().port);
        });
      })
      // If the db client has an error.
      .catch((err: any) => reject(err));
    });
  }

  public close () {
    this.http.close();
  }

  public onClose () {
    process.on('SIGINT', () => {
      this.close();
      console.log('Received SIGINT, Server closing...');
    });
  }

}
