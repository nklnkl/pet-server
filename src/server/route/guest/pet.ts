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

    private retrieve (req: Request, res: Response, next: NextFunction) : void {
			// Retrieve pet owner's info.
			if (!req.params.petId) return res.status(422).end();
      let id: any = req.params.petId;

      this.petDb.retrieve(id)
      .then((pet: Pet) => res.status(200).json(pet.toObject()))
      .catch((err: Error) => next(err));
    }

    private list (req: Request, res: Response, next: NextFunction) : void {

      this.petDb.list()
      .then((pets: Pet[]) => {
        let objects: Array<Object> = [];
        pets.forEach((pet: Pet) => {
          objects.push(pet.toObject());
        });
        res.status(200).json(objects);
      })
      .catch((err: Error) => next(err));

    }
}
