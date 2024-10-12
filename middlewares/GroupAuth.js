const { UserGroup } = require('../models');

exports.groupAuthMiddleware = async (req, res, next) => {
  const groupId = req.params.groupId || req.body.groupId;
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
