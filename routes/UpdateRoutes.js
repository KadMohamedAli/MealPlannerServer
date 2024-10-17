const express = require('express');
const router = express.Router();
const { updateMeal, updateRecipe, updateIngredient, updateUser, updateGroup } = require('../controllers/UpdateController');
const authMiddleware = require('../middlewares/Auth');
const { groupAuthMiddleware,checkIsAdmin,checkIsUser } = require('../middlewares/GroupAuth');


// Update routes
router.put('/meal/:mealId', authMiddleware, groupAuthMiddleware, checkIsAdmin , updateMeal);
router.put('/recipe/:id', authMiddleware, updateRecipe);
router.put('/ingredient/:id', authMiddleware, updateIngredient);
router.put('/user/:id', authMiddleware,checkIsUser, updateUser);
router.put('/group/:id', authMiddleware, groupAuthMiddleware, checkIsAdmin, updateGroup);

module.exports = router;
