import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BidController } from './bid.controller';
import { BidValidation } from './bid.validation';

const router = express.Router();

router
  .route("/")
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

router
  .route("/intrigate")
  .post(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( BidValidation.intrigateBidZodSchema),
    BidController.intrigateWithBid
  )

router
  .route("/pay")
  .post(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( BidValidation.payBidZodSchema),
    BidController.paytheBid
  )

export const BidRoutes = router;
