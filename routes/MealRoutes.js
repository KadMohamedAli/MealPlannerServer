const express = require('express');
const {
  createMealWithRecipe,
  getMealDetails,
  rateMeal,
  getMealsForGroup,
  getMealsForWeek,
  getMealsForNextSevenDays,
  getMeanScoreForMeal,
  getRandomMeal,
  getIntelligentMealSuggestion
} = require('../controllers/mealController');
const authMiddleware = require('../middlewares/Auth');
const { groupAuthMiddleware } = require('../middlewares/GroupAuth');
const router = express.Router();

// Create meal with recipe and ingredients
router.post('/create-with-recipe', authMiddleware, groupAuthMiddleware, createMealWithRecipe);

// Get meal details
router.get('/:mealId', authMiddleware, getMealDetails);

// Rate a meal
router.post('/rate/:mealId', authMiddleware, rateMeal);

// Get meals for a group
router.get('/group/:groupId', authMiddleware, groupAuthMiddleware, getMealsForGroup);

router.get('/group/:groupId/week', authMiddleware, groupAuthMiddleware, getMealsForWeek);
router.get('/group/:groupId/next-seven-days', authMiddleware,groupAuthMiddleware, getMealsForNextSevenDays);
router.get('/:mealId/mean-score', authMiddleware, groupAuthMiddleware, getMeanScoreForMeal);
router.get('/random', authMiddleware, groupAuthMiddleware, getRandomMeal);
router.get('/group/:groupId/intelligent-suggestion', authMiddleware, groupAuthMiddleware, getIntelligentMealSuggestion);

module.exports = router;
