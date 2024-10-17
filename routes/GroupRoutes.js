const express = require('express');
const router = express.Router();
const groupController = require('../controllers/GroupController');
const authMiddleware = require('../middlewares/Auth');
const { groupAuthMiddleware,checkIsAdmin } = require('../middlewares/GroupAuth');


// Create a group and add the creator as an admin
router.post('/create',  authMiddleware, groupController.createGroup);

// Add a user to the group (admin only)
router.post('/addUser', authMiddleware,groupAuthMiddleware, checkIsAdmin, groupController.addUserToGroup);

router.get('/:groupId/members', authMiddleware, groupAuthMiddleware ,groupController.getGroupMembers);

module.exports = router;
