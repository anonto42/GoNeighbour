import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { PaymentController } from "./payment.controller";


const router = Router();

router
    .route("/connected-account")
    .post(
        auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
        PaymentController.createConnectionAccount
    )

router
    .route("/success/:id")
    .get(
        PaymentController.successPageAccount
    )

router
    .route("/refresh/:id")
    .get(
        PaymentController.refreshAccount
    )



export const PaymentRouter = router;