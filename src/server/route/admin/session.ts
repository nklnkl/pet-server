import { SessionDb, AccountDb } from 'pet-db';
import { Session, Account } from 'pet-entity';
import { SessionService, AccountService } from 'pet-business';

import { Router, Request, Response, NextFunction } from 'express';
import { Connection } from 'mongoose';

export { SessionRouter };

class SessionRouter {
    private router: Router;
    private sessionDb: SessionDb;
    private accountDb: AccountDb;

    constructor (dbConnection: Connection) {
      this.router = Router();
      this.sessionDb = new SessionDb(dbConnection);
      this.accountDb = new AccountDb(dbConnection);
      this.routes();
    }

    public getRouter () : Router {
      return this.router;
    }

    // Takes all methods and attaches them to end points.
    private routes () : void {
    }

}
