const express =
  require("express");

const router =
  express.Router();

const autenticar =
  require(
    "../middlewares/auth"
  );

const somenteAdmin =
  require(
    "../middlewares/admin"
  );

const dashboardController =
  require(
    "../controllers/dashboardController"
  );

router.get(
  "/",
  autenticar,
  somenteAdmin,
  dashboardController.resumo
);

module.exports =
  router;