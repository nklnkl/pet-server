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
      this.router.get('/', this.list.bind(this));
      this.router.get('/:petId', this.retrieve.bind(this));
    }

    private async retrieve (req: Request, res: Response, next: NextFunction) : Promise<void> {
			// Retrieve pet owner's info.
			if (!req.params.petId) return res.status(422).end();
      let id: any = req.params.petId;
      let pet: number|Pet;

      try {
        pet = await this.petDb.retrieve(id);
      } catch (err) {
        next(err);
        throw(err);
      }
      if (typeof pet === 'number')
        return res.status(404).end();

      return res.status(200).json(pet.toObject()).end();
    }

    private async list (req: Request, res: Response, next: NextFunction) : Promise<void> {
      let pets: Array<Pet>;

      try {
        pets = await this.petDb.list(req.body.species, req.body.breed);
      } catch (err) {
        next(err);
        throw(err);
      }

      let objects: Array<Object> = [];
      pets.forEach((pet: Pet) => {
        objects.push(pet.toObject());
      });
      res.status(200).json(objects);
    }
}
