import { Router, Request, Response, NextFunction } from 'express';
// import { Connection } from 'mongoose';

export { AdminRouter };

class AdminRouter {
    private router: Router;

    constructor (/*dbConnection: Connection*/) {
      this.router = Router();

      // Service routes
      this.routes();
    }

    public getRouter () : Router {
      return this.router;
    }

    private routes () : void {
      this.router.get('/', this.root.bind(this));
    }

    private root (req: Request, res: Response, next: NextFunction) : void {
      res.status(200).end();
    }
}
