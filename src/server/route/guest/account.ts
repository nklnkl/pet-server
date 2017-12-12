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

    private async create (req: Request, res: Response, next: NextFunction) : Promise<void> {
      // 1. Check data needed.
			if (!req.body.email) return res.status(422).end();
      if (!req.body.password) return res.status(422).end();

      let result: any;

      try {
        result = await AccountService.create(req.body.email, req.body.password, 1)
      } catch (err) {
        throw (err);
      }

      if (typeof result === 'number') {
        if (result == 0) {
          next(result);
          return;
        }
        else {
          res.status(422).json({error: result}).end();
          return;
        }
      }

      try {
        result = await this.accountDb.create(result)
      } catch (err) {
        throw (err);
      }

      res.status(200).json({}).end();
      return;
    }
}
