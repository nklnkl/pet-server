import { PetDb } from 'pet-db';
import { Pet } from 'pet-entity';
import { PetService } from 'pet-business';

import { Router, Request, Response, NextFunction } from 'express';
import { Connection } from 'mongoose';

export { PetRouter };

class PetRouter {
    private router: Router;
    private petDb: PetDb;

    constructor (dbConnection: Connection) {
      this.router = Router();
      this.petDb = new PetDb(dbConnection);
      this.routes();
    }

    public getRouter () : Router {
      return this.router;
    }

    // Takes all methods and attaches them to end points.
    private routes () : void {
      this.router.patch('/', this.update.bind(this));
    }

    private update (req: Request, res: Response, next: NextFunction) : void {
			// Retrieve pet owner's info.
			if (!req.param('petId')) return res.status(422).end();
      let id: any = req.param('petId');

      let update: Pet = new Pet(req.body);

      this.petDb.retrieve(id)
      .then((pet: Pet) => PetService.update(pet, update))
      .then((pet: Pet) => this.petDb.update(id, pet))
      .then((pet: Pet) => res.status(200).end())
      .catch((err: Error) => next(err));
    }
}
