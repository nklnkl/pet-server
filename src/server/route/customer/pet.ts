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
      this.router.post('/', this.create.bind(this));
    }

    private create (req: Request, res: Response, next: NextFunction) : void {
      // 1. Check data needed.
			if (!req.body.species) return res.status(422).end();
      if (!req.body.breed) return res.status(422).end();
      if (!req.body.birthDate) return res.status(422).end();
      if (!req.body.name) return res.status(422).end();
      if (!req.body.status) return res.status(422).end();

			PetService.create(req.body.species, req.body.breed, req.body.birthDate, req.body.name, req.body.status)
      .then((pet: Pet) => this.petDb.create(pet))
			.then((pet: Pet) => res.status(200).json({}).end())
      .catch((err: number) => next(err));
    }
}
