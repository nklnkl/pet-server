import { Router, Request, Response, NextFunction } from 'express';

import { Connection } from 'mongoose';

import { AccountRouter } from './account';
import { SessionRouter } from './session';
import { PetRouter } from './pet';

export { CustomerRouter };

class CustomerRouter {
    private router: Router;
    // Services routess
    private accountRouter: AccountRouter;
    private sessionRouter: SessionRouter;
    private petRouter: PetRouter;

    constructor (dbConnection: Connection) {
      this.router = Router();
      // Service routes
      this.accountRouter = new AccountRouter(dbConnection);
      this.sessionRouter = new SessionRouter(dbConnection);
      this.petRouter = new PetRouter(dbConnection);
      this.routes();
    }

    public getRouter () : Router {
      return this.router;
    }

    private routes () : void {
      this.router.get('/', this.root.bind(this));
      this.router.use('/account', this.accountRouter.getRouter());
      this.router.use('/session', this.sessionRouter.getRouter());
      this.router.use('/pet', this.petRouter.getRouter());
    }

    private root (req: Request, res: Response, next: NextFunction) : void {
      res.status(200).end();
    }
}
