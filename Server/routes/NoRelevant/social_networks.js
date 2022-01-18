const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');

const {
  getSocialNetworks,
  getSocialNetwork,
  createSocialNetwork,
  updateSocialNetwork,
  deleteSocialNetwork,
  addFollowing,
  removeFollowing,
  changeConnection
} = require('../../controllers/social_networks');

router
    .route('/')
    .get(protect, getSocialNetworks)
    .post(protect, createSocialNetwork)
    .put(protect, updateSocialNetwork)
    .delete(protect, deleteSocialNetwork);
router
  .route('/my')
  .get(protect, getSocialNetwork);
  router
  .route('/following/:username')
  .post(protect, addFollowing)
  .delete(protect, removeFollowing);
router.route('/connection').put(protect, changeConnection);

module.exports = router;
