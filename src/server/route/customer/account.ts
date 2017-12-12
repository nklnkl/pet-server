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
      this.accountDb.retrieve(req.get('user-id')||'')
      .then((account: Account) => {
        account.setPassword('');
        return res.json(account.toObject()).end();
      })
      .catch((err: number) => {
        if (err == 0)
          next(err);
        else
          res.status(404).end();
      });
    }

    private async update (req: Request, res: Response, next: NextFunction) : Promise<void> {
      // Constraints
      let update: any = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        birthDate: req.body.birthDate,
        address: req.body.address
      };
      let account: any;

      // Retrieve account.
      try {
        account = await this.accountDb.retrieve(req.get('account-id')||'');
      }
      catch (err) {
        return next(err);
      }

      // Update account.
      try {
        account = await AccountService.update(account, update);
        if (typeof account === 'number') {
          if (account == 0) next(account);
          else {
            res.status(422).json({err: account}).end();
            return;
          }
        }
      }
      catch (err) {
        return next(err);
      }

      // Save Update
      try {
        account = await this.accountDb.update(req.get('user-id')||'', update);
      }
      catch (err) {
        next(account);
      }

      res.status(200).json({}).end();
      return;
    }
}
