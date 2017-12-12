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

    private async update (req: Request, res: Response, next: NextFunction) : Promise<void> {
			// Retrieve pet owner's info.
			if (!req.param('petId')) return res.status(422).end();
      let id: any = req.param('petId');

      let update: Pet = new Pet(req.body);
      let pet: Pet|number;

      try {
        pet = await this.petDb.retrieve(id);
      } catch (err) {
        next(err);
        throw(err);
      }
      if (typeof pet === 'number') {
        return res.status(404).end();
      }

      try {
        pet = await PetService.update(pet, update);
      } catch (err) {
        next(err);
        throw(err);
      }
      if (typeof pet === 'number') {
        return res.status(422).json({err:pet}).end();
      }

      try {
        pet = await this.petDb.update(id, pet);
      } catch (err) {
        next(err);
        throw(err);
      }

      return res.status(200).end();
    }
}
