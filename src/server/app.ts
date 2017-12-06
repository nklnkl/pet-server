import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as Dotenv from 'dotenv';

import { Client as DbClient } from 'pet-db';

import { GuestRouter } from './route/guest/router';
import { CustomerRouter } from './route/customer/router';
import { AdminRouter } from './route/admin/router';

import { SessionDb, AccountDb } from 'pet-db';
import { Session, Account } from 'pet-entity';

export { App };

class App {
    private express: express.Application;
    private logging: boolean;
    private dbClient: DbClient;
    private sessionDb: SessionDb;
    private accountDb: AccountDb;

    constructor (logging: boolean) {
      this.logging = logging;
      this.express = express();
    }

    public start () : Promise<any> {
      return new Promise ((resolve, reject) => {
        this.dbClient = new DbClient();
        this.dbClient.connect()
        .then(() => {
          this.sessionDb = new SessionDb(this.dbClient.getConnection());
          this.accountDb = new AccountDb(this.dbClient.getConnection());
          this.middleware();
          this.routes();
          resolve();
        })
        .catch((err:any) => reject(err));
      });
    }

    private middleware () : void {
      if (this.logging == true)
        this.express.use(logger('dev'));
      this.express.use(this.headers.bind(this));
      this.express.use(bodyParser.json());
      this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    private routes () : void {
      this.express.get('/', (req, res, next) => {
          res.status(200).end();
      });
      let adminRouter: AdminRouter = new AdminRouter(this.dbClient.getConnection());
      this.express.use('/admin', this.isAdmin.bind(this), adminRouter.getRouter());

      let customerRouter: CustomerRouter = new CustomerRouter(this.dbClient.getConnection());
      this.express.use('/customer', this.isCustomer.bind(this), customerRouter.getRouter());

      let guestRouter: GuestRouter = new GuestRouter(this.dbClient.getConnection());
      this.express.use('/guest', guestRouter.getRouter());

      this.express.use(this.error.bind(this));
    }

    private headers (req: express.Request, res: express.Response, next: express.NextFunction) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "userId, sessionId, Origin, X-Requested-With, Content-Type, Accept");
      res.header("Access-Control-Expose-Headers" : "userId, sessionId");
      next();
    }

    private error (err: Error, req: express.Request , res: express.Response, next: express.NextFunction) : void {
      console.log(err);
      res.status(500).json(err);
      return;
    }

    private isAdmin (req: express.Request, res: express.Response, next: express.NextFunction) : void {
      if (!req.get('sessionId')) return res.status(406).end();
      if (!req.get('userId')) return res.status(406).end();
      let sessionId: any = req.get('sessionId');
      let userId: any = req.get('userId');
      this.sessionDb.retrieve(sessionId)
      .then((session: Session) => {
        if (session.getUserId() != userId)
          throw new Error('session not found');
        return this.accountDb.retrieve(userId);
      })
      .then((account: Account) => {
        if (account.getLevel() != 2)
          throw new Error('user not admin')
        next();
      })
      .catch((err: Error) => next(err));
    }

    private isCustomer (req: express.Request, res: express.Response, next: express.NextFunction) : void {
      if (!req.get('sessionId')) return res.status(406).end();
      if (!req.get('userId')) return res.status(406).end();
      let sessionId: any = req.get('sessionId');
      let userId: any = req.get('userId');
      this.sessionDb.retrieve(sessionId)
      .then((session: Session) => {
        if (session.getUserId() != userId)
          throw new Error('session not found');
        next();
      })
      .catch((err: Error) => next(err));
    }

    public getExpress () : express.Application {
      return this.express;
    }
}
