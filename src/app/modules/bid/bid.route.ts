import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BidController } from './bid.controller';
import { BidValidation } from './bid.validation';

const router = express.Router();

router
  .route("/")
  .get()
  .post(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( BidValidation.defaultZodSchema ),
    BidController.sendBid
  );

router
  .route("/requests")
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    BidController.bidRequestes
  )

router
  .route("/requests/adventurer")
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    BidController.bidRequestesAsAdvengrar
  )

export const BidRoutes = router;
