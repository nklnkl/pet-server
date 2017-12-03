import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';

// import { Client as DbClient } from '@cryptoproject/casino-db';

// import { PlayerRouter } from './routes/player/router';
// import { AdminRouter } from './routes/admin/router';

export { App };

class App {
    private express: express.Application;
    private logging: boolean;
    // private dbClient: DbClient;

    /**
    the database client that will come from the database module.
    private dbClient: DbClient;
    **/

    constructor (logging: boolean) {
      this.logging = logging;
      this.express = express();
    }

    public start () : Promise<any> {
      return new Promise ((resolve, reject) => {
        /*
        this.dbClient = new DbClient();
        this.dbClient.connect()
        .then(() => {
          this.middleware();
          this.routes();
          this.error();
          resolve();
        })
        .catch((err:any) => reject(err));
        */
      });
    }

    private middleware () : void {
        if (this.logging == true)
            this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    private routes () : void {

        this.express.get('/', (req, res, next) => {
            res.status(200).end();
        });
        /*
        let adminRouter: AdminRouter = new AdminRouter(this.dbClient.getConnection());
        this.express.use('/admin', adminRouter.getRouter());

        let playerRouter: PlayerRouter = new PlayerRouter(this.dbClient.getConnection());
        this.express.use('/player', playerRouter.getRouter());
        */
        /*
        these routers are commented out because there is no
        database client to send to these routers.
        for now, we are using routes with no connection to database above

        let guestRouter: GuestRouter = new GuestRouter(this.dbClient);
        this.express.use('/guest', guestRouter.getRouter());

        let adminRouter: AdminRouter = new AdminRouter(this.dbClient);
        this.express.use('/admin', adminRouter.getRouter());

        let userRouter: UserRouter = new UserRouter(this.dbClient);
        this.express.use('/user', userRouter.getRouter());
        */
    }

    private error () : void {

    }

    public getExpress () : express.Application {
        return this.express;
    }
}
