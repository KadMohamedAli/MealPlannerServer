const Group = require('../models/Group');
const User = require('../models/User');
const UserGroup = require('../models/UserGroup');
const db = require('../models/index');

// Create a new group and add the creator as an admin
exports.createGroup = async (req, res) => {
  try {
    const { groupName } = req.body;

    // Check if req.user is defined
    if (!req.user) {
        return res.status(400).json({ error: 'User is not authenticated' });
    }

    // Use user information directly from req.user
    const { id: id } = req.user;

    // Create the group
    const group = await db.Group.create({ name: groupName });

    // Add the user to the group as an admin
    await db.UserGroup.create({
        userId: id,
        groupId: group.id,
        isAdmin: true
    });

    res.status(201).json({
        message: 'Group created successfully, and user added as admin',
        group
    });
} catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error, could not create group' });
}
};

exports.getGroupMembers = async(req,res) =>{
    try {
      const { groupId } = req.params;

      // Check if the user is part of the group
      const userGroup = await db.UserGroup.findOne({
          where: {
              userId: req.user.id, // Use the authenticated user's ID
              groupId: groupId
          }
      });

      if (!userGroup) {
          return res.status(403).json({ error: 'You are not a member of this group' });
      }


      const members = await db.Group.findAll({
        where : { id : groupId},
        include : {
          model : db.User,
          attributes : ['id','username','name'],
          through :{
            attributes : ['isAdmin'],
            where :{GroupId: groupId}
          } 
        }
      });

      res.status(200).json({ members });
  } catch (error) {
      console.error('Error retrieving group members:', error);
      res.status(500).json({ message: 'Server error, could not retrieve group members' });
  }

};

// Add a user to the group (admin only)
exports.addUserToGroup = async (req, res) => {
    try {
      const { groupId, newUserId, isAdmin } = req.body;

      // Check if req.user is defined
      if (!req.user) {
          return res.status(401).json({ error: 'User is not authenticated' });
      }

      const currentUserId = req.user.id; // Get the authenticated user's ID

      // Check if the current user is an admin of the group
      const userGroup = await db.UserGroup.findOne({
          where: {
              userId: currentUserId,
              groupId: groupId,
              isAdmin: true
          }
      });

      if (!userGroup) {
          return res.status(403).json({ error: 'You are not an admin of this group' });
      }

      // Check if the user to be added is already in the group
      const existingUserGroup = await db.UserGroup.findOne({
          where: {
              userId: newUserId,
              groupId: groupId
          }
      });

      if (existingUserGroup) {
          return res.status(400).json({ error: 'User is already in this group' });
      }

      // Add the new user to the group
      await db.UserGroup.create({
          userId: newUserId,
          groupId: groupId,
          isAdmin: isAdmin // Assign admin status based on request
      });

      res.status(201).json({
          message: 'User added to group successfully',
          userId: newUserId,
          groupId: groupId,
          isAdmin
      });
  } catch (error) {
      console.error('Error adding user to group:', error);
      res.status(500).json({ message: 'Server error, could not add user to group' });
  }
};
