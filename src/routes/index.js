const express = require('express');
const verifyAuthToken = require('../middleware/verifyAuthToken');

const authRoute = require('./auth.route');
const classRoute = require('./class.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/class',
    route: classRoute,
    middlewares: [
      verifyAuthToken,
    ],
  },
];

defaultRoutes.forEach((route) => {
  // setting middlewares as default
  if (!route.middlewares) Object.assign(route, { middlewares: [] });

  router.use(
    route.path,
    ...route.middlewares,
    route.route,
  );
});

module.exports = router;
