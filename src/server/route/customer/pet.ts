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
      this.routes();
      this.petDb = new PetDb(dbConnection);
    }

    public getRouter () : Router {
      return this.router;
    }

    // Takes all methods and attaches them to end points.
    private routes () : void {
      this.router.post('/', this.create.bind(this));
      this.router.get('/', this.list.bind(this));
      this.router.get('/:id', this.retrieve.bind(this));
      this.router.patch('/', this.update.bind(this));
    }

    private create (req: Request, res: Response, next: NextFunction) : void {
      // 1. Check data needed.
			if (!req.body.species) res.status(422).end();
      if (!req.body.breed) res.status(422).end();
      if (!req.body.birthDate) res.status(422).end();
      if (!req.body.name) res.status(422).end();
      if (!req.body.status) res.status(422).end();

			PetService.create(req.body.species, req.body.breed, req.body.birthDate, req.body.name, req.body.status)
      .then((pet: Pet) => this.petDb.create(pet))
			.then((pet: Pet) => res.status(200).end())
      .catch((err: Error) => next(err));
    }

    private retrieve (req: Request, res: Response, next: NextFunction) : void {
			// Retrieve pet owner's info.
			if (!req.param('id')) res.status(422).end();
      let id: any = req.param('id');

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

    private update (req: Request, res: Response, next: NextFunction) : void {
			// Retrieve pet owner's info.
			if (!req.get('id')) res.status(422).end();
      let id: any = req.get('id');

      let update: Pet = new Pet(req.body);

      this.petDb.retrieve(id)
      .then((pet: Pet) => PetService.update(pet, update))
      .then((pet: Pet) => this.petDb.update(id, pet))
      .then((pet: Pet) => res.status(200).end())
      .catch((err: Error) => next(err));
    }
}
