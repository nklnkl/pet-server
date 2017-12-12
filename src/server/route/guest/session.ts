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
      this.router.post('/', this.create.bind(this));
    }

    private async create (req: Request, res: Response, next: NextFunction) : Promise<void> {
			// Retrieve account owner's info.
			if (!req.body.email) return res.status(422).end();
      if (!req.body.password) return res.status(422).end();

      let email: any = req.body.email;
      let password: any = req.body.password;
      let account: Account | number;

      // Try to retrieve email.
      try {
        account = await this.accountDb.retrieveByEmail(email);
      // If error, return early.
      } catch (err) {
        next(err);
        throw(err);
      }
      // If not found, return early.
      if (typeof account === 'number')
        return res.status(401).end();

      // Check password.
      let match: boolean;
      try {
        match = await AccountService.checkPassword(password, account.getPassword());
      } catch (err) {
        next(err);
        throw(err);
      }
      // If not matched, return early.
      if (!match) {
        return res.status(401).end();
      }

      // Try to create session.
      let session: Session;
      try {
        session = await SessionService.create(account.getId());
      } catch (err) {
        next(err);
        throw(err);
      }

      // Try to save session.
      try {
          session = await this.sessionDb.create(session);
      } catch (err) {
        next(err);
        throw(err);
      }

      return res.status(200).json(session.toObject()).end();
    }
}
