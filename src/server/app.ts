import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';

import { Client as DbClient } from 'pet-db';

import { GuestRouter } from './route/guest/router';
import { CustomerRouter } from './route/customer/router';
import { AdminRouter } from './route/admin/router';

export { App };

class App {
    private express: express.Application;
    private logging: boolean;
    private dbClient: DbClient;

    constructor (logging: boolean) {
      this.logging = logging;
      this.express = express();
    }

    public start () : Promise<any> {
      return new Promise ((resolve, reject) => {
        this.dbClient = new DbClient();
        this.dbClient.connect()
        .then(() => {
          this.middleware();
          this.routes();
          this.error();
          resolve();
        })
        .catch((err:any) => reject(err));
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
      let adminRouter: AdminRouter = new AdminRouter(this.dbClient.getConnection());
      this.express.use('/admin', adminRouter.getRouter());

      let customerRouter: CustomerRouter = new CustomerRouter(this.dbClient.getConnection());
      this.express.use('/customer', customerRouter.getRouter());

      let guestRouter: GuestRouter = new GuestRouter(this.dbClient.getConnection());
      this.express.use('/guest', guestRouter.getRouter());
    }

    private error () : void {

    }

    public getExpress () : express.Application {
      return this.express;
    }
}
