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

    private async retrieve (req: Request, res: Response, next: NextFunction) : Promise<void> {
      let account: number|Account;

      try {
        account = await this.accountDb.retrieve(req.get('user-id')||'');
      } catch (err) {
        next(err);
        throw(err);
      }
      if (typeof account === 'number')
        return res.status(404).end();

      account.setPassword('');
      res.status(200).json(account.toObject()).end();
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
        next(err);
        throw(err);
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
        next(err);
        throw(err);
      }

      // Save Update
      try {
        account = await this.accountDb.update(req.get('user-id')||'', update);
      }
      catch (err) {
        next(err);
        throw(err);
      }

      res.status(200).json({}).end();
      return;
    }
}
