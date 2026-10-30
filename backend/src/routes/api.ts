import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as authCtrl from '../controllers/authController.js';
import * as profileCtrl from '../controllers/profileController.js';
import * as prefCtrl from '../controllers/preferencesController.js';
import * as recCtrl from '../controllers/recommendationController.js';
import * as assistantCtrl from '../controllers/assistantController.js';
import * as searchCtrl from '../controllers/searchController.js';
import * as actCtrl from '../controllers/activityController.js';
import * as analyticsCtrl from '../controllers/analyticsController.js';
import * as privacyCtrl from '../controllers/privacyController.js';

const router = Router();

// Public Auth routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.post('/auth/logout', authCtrl.logout);
router.post('/auth/forgot-password', authCtrl.forgotPassword);

// Protected routes (apply requireAuth)
router.use(requireAuth);

// Profile
router.get('/profile', profileCtrl.getProfile);
router.put('/profile', profileCtrl.updateProfile);
router.post('/profile/onboarding', profileCtrl.submitOnboarding);
router.post('/profile/reset', profileCtrl.resetProfile);

// Preferences
router.get('/preferences', prefCtrl.getPreferences);
router.put('/preferences', prefCtrl.updatePreferences);

// Recommendations
router.get('/recommendations', recCtrl.getRecommendations);
router.post('/recommendations/generate', recCtrl.generateNewRecommendations);
router.get('/recommendations/saved', recCtrl.getSavedRecommendations);
router.post('/recommendations/:id/feedback', recCtrl.submitFeedback);
router.delete('/recommendations/:id/feedback', recCtrl.removeFeedback);

// AI Assistant
router.get('/assistant/conversations', assistantCtrl.listConversations);
router.get('/assistant/conversations/:id/messages', assistantCtrl.getConversationMessages);
router.post('/assistant/chat', assistantCtrl.sendMessage);

// Smart Search
router.post('/search', searchCtrl.searchRecommendations);
router.get('/search/history', searchCtrl.getSearchHistory);
router.delete('/search/history', searchCtrl.clearSearchHistory);

// Activity
router.post('/activity', actCtrl.logActivity);
router.get('/activity', actCtrl.getActivityHistory);

// Analytics
router.get('/analytics', analyticsCtrl.getAnalytics);

// Privacy & Export
router.post('/privacy/export', privacyCtrl.exportUserData);
router.post('/privacy/clear-history', privacyCtrl.clearUserHistory);
router.put('/privacy/settings', privacyCtrl.updatePrivacySettings);

export default router;
