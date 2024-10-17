const { Meal, Recipe, Ingredient, User, Group } = require('../models');

// Update a meal
exports.updateMeal = async (req, res) => {
  const { mealId } = req.params;
  const { name, mealNumber, date } = req.body;

  try {
    const meal = await Meal.findByPk(mealId);
    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    await meal.update({ name, mealNumber, date });
    res.json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating meal' });
  }
};

// Update a recipe
exports.updateRecipe = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const recipe = await Recipe.findByPk(id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    await recipe.update({ name, description });
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating recipe' });
  }
};

// Update an ingredient
exports.updateIngredient = async (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;

  try {
    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) return res.status(404).json({ error: 'Ingredient not found' });

    await ingredient.update({ name, quantity });
    res.json(ingredient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating ingredient' });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const {name } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({ name });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user' });
  }
};

// Update a group
exports.updateGroup = async (req, res) => {
  const { id } = req.params;
  const { groupName } = req.body;

  try {
    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    await group.update({ groupName });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating group' });
  }
};
