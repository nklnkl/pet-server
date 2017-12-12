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

    private create (req: Request, res: Response, next: NextFunction) : void {
			// Retrieve account owner's info.
			if (!req.body.email) return res.status(422).end();
      if (!req.body.password) return res.status(422).end();

      let email: any = req.body.email;
      let password: any = req.body.password;
      let acc: Account;

      // Retrieve email.
      this.accountDb.retrieveByEmail(email)
      .catch((err: number) => {
        if (err == 0) next(err);
        else res.status(401).end();
        throw(err);
      })
      // Check password
      .then((account: Account) => {
        acc = account;
        return AccountService.checkPassword(password, account.getPassword());
      })
      .catch((err: number) => {
        throw(err);
      })
      // Create Session.
      .then((match: boolean) => {
        if (!match) {
          res.status(401).end();
          throw(acc.getId() + ' password check failed');
        }
        else {
          return SessionService.create(acc.getId());
        }
      })
      // Save session to database.
      .then((session: Session) => this.sessionDb.create(session))
      .catch((err: number) => {
        throw(err);
      })
      // Response.
      .then((session: Session) => {
        res.status(200).json(session.toObject());
      })
      .catch((err: number) => next(err));
    }
}
