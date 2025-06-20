import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { PostValidation } from "./post.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { PostController } from "./post.controller";


const router = Router();

router
    .route("/one/:id")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.aPost
    )
router
    .route('/upload/do')
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
        PostController.updateAPost
    )

router 
    .route("/latest")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.lastPosts
    )

router
    .route("/favorite")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.favorites
    )

router
    .route("/favorite/add/:id")
    .post(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.addFavorites
    )

router
    .route("/favorite/delete/:id")
    .delete(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.removeFavorites
    )

export const PostRouter = router;