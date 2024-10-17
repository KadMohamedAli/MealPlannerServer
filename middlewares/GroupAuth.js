const { UserGroup,Meal } = require('../models');

exports.groupAuthMiddleware = async (req, res, next) => {
  let groupId = req.params.groupId || req.body.groupId;
  if (req.params.mealId){
    const meal = await Meal.findOne({
      where : { id: req.params.mealId},
    });
    groupId=meal.GroupId;
    console.log('group id is : ',groupId,', mealId is : ',req.params.mealId);
  }
  try {
    const userGroup = await UserGroup.findOne({
      where: { UserId: req.user.id, GroupId: groupId },
    });
    if (!userGroup) return res.status(403).json({ error: 'Not authorized for this group' });

    req.userGroup = userGroup;
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Group authorization error' });
  }
};

exports.checkIsAdmin = (req, res, next) => {
  if (!req.userGroup.isAdmin) return res.status(403).json({ error: 'Admin privileges required' });
  next();
};

exports.checkIsUser = (req, res, next) => {
  if(!req.user.id=== req.params.id) 
    return res.status(403).json({error :"Can't edit other users"});
  next();
};
