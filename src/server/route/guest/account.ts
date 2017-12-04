import { AccountDb } from 'pet-db';
import { Account } from 'pet-entity';
import { AccountService } from 'pet-business';

import { Router, Request, Response, NextFunction } from 'express';
import { Connection } from 'mongoose';

export { AccountRouter };

class AccountRouter {
    private router: Router;
    private accountDb: AccountDb;

    constructor (dbConnection: Connection) {
      this.router = Router();
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
      // 1. Check data needed.
			if (!req.body.email) return res.status(422).end();
      if (!req.body.password) return res.status(422).end();

			AccountService.create(req.body.email, req.body.password, 1)
      .then((account: Account) => this.accountDb.create(account))
			.then((account: Account) => res.json( {id: account.getId()} ))
      .catch((err: Error) => next(err));
    }

}
