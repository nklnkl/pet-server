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

    private async create (req: Request, res: Response, next: NextFunction) : Promise<void> {
      // 1. Check data needed.
			if (!req.body.species) return res.status(422).end();
      if (!req.body.breed) return res.status(422).end();
      if (!req.body.birthDate) return res.status(422).end();
      if (!req.body.name) return res.status(422).end();
      if (!req.body.status) return res.status(422).end();

      let images: Array<string> = [];
      let pet: Pet|number;

      try {
        pet = await PetService.create(req.body.species, req.body.breed, req.body.birthDate, req.body.name, req.body.status, images)
      } catch (err) {
        next(err);
        throw(err);
      }
      if (typeof pet === 'number') {
        return res.status(422).json({err:pet}).end();
      }

      try {
        pet = await this.petDb.create(pet);
      } catch (err) {
        next(err);
        throw(err);
      }

      return res.status(200).json({}).end();
    }
}
