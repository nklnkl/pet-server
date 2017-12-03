import { Router, Request, Response, NextFunction } from 'express';
/*
import { Connection } from 'mongoose';

import { AccountRouter } from './account';
import { SessionRouter } from './session';
import { WagerRouter } from './wager';
import { DepositRouter } from './deposit';
import { WithdrawalRouter } from './withdrawal';
*/
export { PlayerRouter };

class PlayerRouter {
    private router: Router;
/*
    // Services routes.
    private accountRouter: AccountRouter;
    private sessionRouter: SessionRouter;
    private wagerRouter: WagerRouter;
    private depositRouter: DepositRouter;
    private withdrawalRouter: WithdrawalRouter;
*/
    constructor (/*dbConnection: Connection*/) {
      this.router = Router();
/*
      // Service routes
      this.accountRouter = new AccountRouter(dbConnection);
      this.sessionRouter = new SessionRouter(dbConnection);
      this.wagerRouter = new WagerRouter(dbConnection);
      this.depositRouter = new DepositRouter(dbConnection);
      this.withdrawalRouter = new WithdrawalRouter(dbConnection);
      this.routes(); */
    }

    /* Since there is no available database client yet,
    this is commented out.
    constructor (dbClient: Client) {
        this.router = Router();

        // Service routes
        this.routes();
    }
    */

    public getRouter () : Router {
      return this.router;
    }

    private routes () : void {/*
      this.router.get('/', this.root.bind(this));
      this.router.use('/account', this.accountRouter.getRouter());
      this.router.use('/session', this.sessionRouter.getRouter());
      this.router.use('/wager', this.wagerRouter.getRouter());
      this.router.use('/deposit', this.depositRouter.getRouter());
      this.router.use('/withdrawal', this.withdrawalRouter.getRouter());
      */
    }

    private root (req: Request, res: Response, next: NextFunction) : void {
      res.status(200).end();
    }
}
