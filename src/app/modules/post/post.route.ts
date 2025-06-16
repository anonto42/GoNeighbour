import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { PostValidation } from "./post.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { PostController } from "./post.controller";


const router = Router();

router
    .route("/")
    .get()
    .post(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        fileUploadHandler(),
        validateRequest( PostValidation.createPostZodSchema ),
        PostController.createPost
    )
    .put(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        fileUploadHandler(),
        validateRequest( PostValidation.updatePostZodSchema ),
        PostController.createPost
    )


export const PostRouter = router;