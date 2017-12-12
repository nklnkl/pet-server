import * as path from 'path';
import * as express from 'express';
import * as Cors from 'cors';
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

      this.express.use(bodyParser.json());
      this.express.use(bodyParser.urlencoded({ extended: false }));
      this.express.use(Cors());
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

    private error (err: Error, req: express.Request , res: express.Response, next: express.NextFunction) : void {
      console.log(err);
      res.status(500).json(err);
      return;
    }

    private async isAdmin (req: express.Request, res: express.Response, next: express.NextFunction) : Promise<void> {
      if (!req.get('session-id')) return res.status(406).end();
      if (!req.get('account-id')) return res.status(406).end();
      let sessionId: any = req.get('session-id');
      let accountId: any = req.get('account-id');
      let session: number | Session;
      let account: number | Account;

      try {
        session = await this.sessionDb.retrieve(sessionId);
      } catch (err) {
        next (err);
        throw (err);
      }

      if (typeof session === 'number')
        return res.status(401).end();
      else {
        if (session.getAccountId() != accountId)
          return res.status(401).end();
      }

      try {
        account = await this.accountDb.retrieve(accountId);
      } catch (err) {
        next (err);
        throw (err);
      }

      if (typeof account === 'number') {
        return res.status(401).end();
      } else {
        if (account.getLevel() != 2)
          return res.status(403).end();
      }
    }

    private async isCustomer (req: express.Request, res: express.Response, next: express.NextFunction) : Promise<void> {
      if (!req.get('session-id')) return res.status(406).end();
      if (!req.get('account-id')) return res.status(406).end();
      let sessionId: any = req.get('session-id');
      let accountId: any = req.get('account-id');
      let session: number | Session;
      let account: number | Account;

      try {
        session = await this.sessionDb.retrieve(sessionId);
      } catch (err) {
        next (err);
        throw (err);
      }

      if (typeof session === 'number')
        return res.status(401).end();
      else {
        if (session.getAccountId() != accountId)
          return res.status(401).end();
      }
    }

    public getExpress () : express.Application {
      return this.express;
    }
}
