const { Meal, Recipe, Ingredient, UserMeal } = require('../models');

// Create a new meal with a recipe and ingredients
exports.createMealWithRecipe = async (req, res) => {
  const { name, mealNumber, groupId, recipeName, recipeDescription, ingredients } = req.body;

  try {
    const meal = await Meal.create({ name, mealNumber, GroupId: groupId });

    // Create the recipe
    const recipe = await Recipe.create({
      name: recipeName,
      description: recipeDescription,
      MealId: meal.id,
    });

    // Add ingredients to the recipe
    for (const ingredientData of ingredients) {
      const [ingredient] = await Ingredient.findOrCreate({
        where: { name: ingredientData.name },
        defaults: { quantity: ingredientData.quantity },
      });

      await recipe.addIngredient(ingredient, { through: { quantity: ingredientData.quantity } });
    }

    res.status(201).json({ meal, recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating meal with recipe and ingredients' });
  }
};

// Get meal with recipe and ingredients
exports.getMealDetails = async (req, res) => {
  const { mealId } = req.params;

  try {
    const meal = await Meal.findByPk(mealId, {
      include: [
        {
          model: Recipe,
          as: 'recipe',
          include: [
            {
              model: Ingredient,
              as: 'ingredients',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching meal details' });
  }
};

// Rate a meal
exports.rateMeal = async (req, res) => {
  const { mealId, score } = req.body;

  try {
    const userMeal = await UserMeal.create({ UserId: req.user.id, MealId: mealId, score });
    res.status(201).json(userMeal);
  } catch (err) {
    res.status(500).json({ error: 'Error rating meal' });
  }
};

// Get meals for a group (including recipes and ingredients)
exports.getMealsForGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const meals = await Meal.findAll({
      where: { GroupId: groupId },
      include: [
        {
          model: Recipe,
          as: 'recipe',
          include: [
            {
              model: Ingredient,
              as: 'ingredients',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching meals for group' });
  }
};
