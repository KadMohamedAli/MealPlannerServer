const { Meal, Recipe, Ingredient, UserMeal } = require('../models');
const { Sequelize,Op } = require('sequelize');
const moment = require('moment');


// Create a new meal with a recipe and ingredients or clone an existing one
// Create a new meal with a recipe and ingredients or clone an existing one
exports.createMealWithRecipe = async (req, res) => {
  const { name, mealNumber, date, groupId, recipeName, recipeDescription, ingredients } = req.body;

  try {
    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }

    // Create a new meal
    const newMeal = await Meal.create({ name, mealNumber, date, GroupId: groupId });

    if (recipeName && ingredients) {
      // If recipe and ingredients are provided, create them
      const recipe = await Recipe.create({
        name: recipeName,
        description: recipeDescription,
        MealId: newMeal.id,
      });

      // Add ingredients to the recipe
      for (const ingredientData of ingredients) {
        const [ingredient] = await Ingredient.findOrCreate({
          where: { name: ingredientData.name },
          defaults: { quantity: ingredientData.quantity },
        });

        await recipe.addIngredient(ingredient, { through: { quantity: ingredientData.quantity } });
      }
    } else {
      // If no recipe and ingredients are provided, try to clone from an existing meal
      const existingMeal = await Meal.findOne({
        where: { name },
        include: {
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
        order: [[{ model: Recipe, as: 'recipe' }, { model: Ingredient, as: 'ingredients' }, 'id', 'DESC']],
      });

      if (existingMeal && existingMeal.recipe) {
        // Clone the existing recipe
        const clonedRecipe = await Recipe.create({
          name: existingMeal.recipe.name,
          description: existingMeal.recipe.description,
          MealId: newMeal.id,
        });

        // Clone the ingredients
        for (const ingredient of existingMeal.recipe.ingredients) {
          const quantity = ingredient.RecipeIngredient ? ingredient.RecipeIngredient.quantity : null;
          await clonedRecipe.addIngredient(ingredient, {
            through: { quantity: quantity || '0' }, // Use a default value if quantity is null
          });
        }
      }
    }

    res.status(201).json(newMeal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating meal' });
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


exports.rateMeal = async (req, res) => {
  const { mealId } = req.params; // Extract mealId from the URL
  const { score } = req.body;

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

// Get meals for a specific year and week
exports.getMealsForWeek = async (req, res) => {
  const groupId = req.params.groupId;
  const { year, month, week } = req.body;

  try {
    // Calculate the start and end dates of the specified week
    const startDate = moment().year(year).month(month - 1).week((month)*4+week).startOf('week').toDate();
    const endDate = moment(startDate).add(6, 'days').endOf('day').toDate();

    const meals = await Meal.findAll({
      where: {
        GroupId: groupId,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
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
    console.error(err);
    res.status(500).json({ error: 'Error fetching meals for the specified week' });
  }
};

exports.getMealsForNextSevenDays = async (req, res) => {
  const groupId = req.params.groupId;
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 6); // 7-day range

  try {
    const meals = await Meal.findAll({
      where: {
        GroupId: groupId,
        date: {
          [Op.between]: [today, nextWeek]
        }
      },
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
    res.status(500).json({ error: 'Error fetching meals for the next seven days' });
  }
};

// Get mean score for a meal
exports.getMeanScoreForMeal = async (req, res) => {
  const { mealId } = req.params;

  try {
    const result = await UserMeal.findAll({
      where: { MealId: mealId },
      attributes: [[Sequelize.fn('AVG', Sequelize.col('score')), 'meanScore']],
    });

    res.json(result[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error calculating mean score for the meal' });
  }
};

exports.getaRandomMeal = async (req, res) => {
  const maxRetries = 5; // Limit the number of retries
  let attempts = 0;
  try {
    const count = await Meal.count(); // Count the total number of meals
    if (count === 0) {
      return res.status(404).json({ error: 'No meals found' });
    }

    while (attempts < maxRetries) {
      attempts++;
      const randomIndex = Math.floor(Math.random() * count);
      const randomMeal = await Meal.findOne({
        offset: randomIndex,
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

      if (randomMeal) {
        return res.json(randomMeal); // If a meal is found, return it
      }
    }

    // If no meal is found after the maximum number of retries
    res.status(404).json({ error: 'Unable to find a random meal after several attempts' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error fetching a random meal' });
  }
};


exports.getIntelligentMealSuggestion = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    // Example algorithm: Fetch the most rated meals in the past for the group
    const meal = await UserMeal.findOne({
      where: { GroupId: groupId },
      attributes: ['MealId', [Sequelize.fn('AVG', Sequelize.col('score')), 'avgScore']],
      group: ['MealId'],
      order: [[Sequelize.literal('avgScore'), 'DESC']],
      limit: 1,
      include: [
        {
          model: Meal,
          as: 'meal',
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
        },
      ],
    });

    if (!meal) {
      return res.status(404).json({ error: 'No suitable meal found' });
    }

    res.json(meal);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error suggesting an intelligent meal' });
  }
};


