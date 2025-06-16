import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validaiton';
import { AdminController } from './admin.controller';
const router = express.Router();


router
  .route('/about-us')
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    AdminController.GetAboutUsData
  )
  .post(
    auth( USER_ROLES.ADMIN ),
    validateRequest(AdminValidation.createAbouUsZodSchema),
    AdminController.PostAboutUs
  )
  .patch(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.createUpdateAbouUsZodSchema ),
    AdminController.UpdateAboutUsData
  )

router
  .route("/conditions")
  .get(
    auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
    AdminController.GetConditionsData
  )
  .post(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.createAbouUsZodSchema ),
    AdminController.CreateConditionsData
  )
  .patch(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.createAbouUsZodSchema ),
    AdminController.UpdateAboutUsData
  )

router
  .route("/faq")
  .get(
    auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
    AdminController.GetFAQData
  )
  .post(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.createAbouUsZodSchema ),
    AdminController.CreateFAQData
  )
  .patch(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.createAbouUsZodSchema ),
    AdminController.UpdateFAQData
  )

export const AdminRouter = router;
