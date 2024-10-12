const express = require('express');
const {
  createMealWithRecipe,
  getMealDetails,
  rateMeal,
  getMealsForGroup,
} = require('../controllers/mealController');
const authMiddleware = require('../middlewares/Auth');
const { groupAuthMiddleware } = require('../middlewares/GroupAuth');
const router = express.Router();

// Create meal with recipe and ingredients
router.post('/create-with-recipe', authMiddleware, groupAuthMiddleware, createMealWithRecipe);

// Get meal details
router.get('/:mealId', authMiddleware, getMealDetails);

// Rate a meal
router.post('/rate', authMiddleware, rateMeal);

// Get meals for a group
router.get('/group/:groupId', authMiddleware, groupAuthMiddleware, getMealsForGroup);

module.exports = router;
