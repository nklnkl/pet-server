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
      this.router.get('/', this.retrieve.bind(this));
      this.router.patch('/', this.update.bind(this));
    }

    private retrieve (req: Request, res: Response, next: NextFunction) : void {
			// Retrieve account owner's info.
			if (!req.get('userId')) return res.status(422).end();
      let id: any = req.get('userId');

      this.accountDb.retrieve(id)
      .then((account: Account) => {
        account.setPassword('');
        res.json(account).end();
      })
      .catch((err: Error) => next(err));
    }

    private update (req: Request, res: Response, next: NextFunction) : void {
			// Retrieve account owner's info.
			if (!req.get('userId')) return res.status(400).end();
      let id: any = req.get('userId');

      let update: Account = new Account(req.body);

      this.accountDb.retrieve(id)
      .then((account: Account) => AccountService.update(account, update))
      .then((account: Account) => this.accountDb.update(id, account))
      .then((account: Account) => res.status(200).end())
      .catch((err: Error) => next(err));
    }
}
