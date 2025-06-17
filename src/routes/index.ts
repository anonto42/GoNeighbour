import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { AdminRouter } from '../app/modules/admin/admin.route';
import { PostRouter } from '../app/modules/post/post.route';
import { KeywordhRouter } from '../app/modules/keywords/keyword.route';
import { ChatRoutes } from '../app/modules/chat/chat.route';
import { MessageRoutes } from '../app/modules/message/message.route';
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
  },
  {
    path: "/keyword",
    route: KeywordhRouter
  },
  {
    path: "/chat",
    route: ChatRoutes
  },
  {
    path: "/message",
    route: MessageRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
