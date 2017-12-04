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
      this.routes();
      this.accountDb = new AccountDb(dbConnection);
    }

    public getRouter () : Router {
      return this.router;
    }

    // Takes all methods and attaches them to end points.
    private routes () : void {
      this.router.post('/', this.create.bind(this));
      this.router.get('/', this.retrieve.bind(this));
      this.router.patch('/', this.update.bind(this));
    }

    private create (req: Request, res: Response, next: NextFunction) : void {
      // 1. Check data needed.
			if (!req.body.email) res.status(422).end();
      if (!req.body.password) res.status(422).end();

			AccountService.create(req.body.email, req.body.password, 1)
      .then((account: Account) => this.accountDb.create(account))
			.then((account: Account) => res.json( {id: account.getId()} ))
      .catch((err: Error) => next(err));
    }

    private retrieve (req: Request, res: Response, next: NextFunction) : void {
			// Retrieve account owner's info.
			if (!req.get('id')) res.status(422).end();
      let id: any = req.get('id');

      this.accountDb.retrieve(id)
      .then((account: Account) => {
        account.setPassword('');
        res.json(account).end();
      })
      .catch((err: Error) => next(err));
    }

    private update (req: Request, res: Response, next: NextFunction) : void {
			// Retrieve account owner's info.
			if (!req.get('id')) res.status(400).end();
      let id: any = req.get('id');

      let update: Account = new Account(req.body);

      this.accountDb.retrieve(id)
      .then((account: Account) => AccountService.update(account, update))
      .then((account: Account) => this.accountDb.update(id, account))
      .then((account: Account) => res.status(200).end())
      .catch((err: Error) => next(err));
    }
}
