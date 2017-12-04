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

      this.accountDb.retrieveByEmail(email)
      .then((account: Account) => AccountService.checkPassword(password, account.getPassword()))
      .then((match: boolean) => this.accountDb.retrieveByEmail(email))
      .then((account: Account) => SessionService.create(account.getId()))
      .then((session: Session) => this.sessionDb.create(session))
      .then((session: Session) => {
        let object: Object = {
          userId: session.getUserId(),
          sessionId: session.getId()
        };
        res.status(200).json(object);
      })
      .catch((err: Error) => next(err));
    }
}
