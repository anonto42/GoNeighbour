import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { AdminRouter } from '../app/modules/admin/admin.route';
import { PostRouter } from '../app/modules/post/post.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/admin',
    route: AdminRouter
  },
  {
    path: "/post",
    route: PostRouter
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
