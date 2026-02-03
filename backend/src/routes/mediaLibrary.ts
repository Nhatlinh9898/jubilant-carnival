import { Router } from 'express';
import { MediaLibraryController } from '@/controllers/mediaLibraryController';

const router = Router();
const mediaController = new MediaLibraryController();

// Media search and discovery
router.post('/search', mediaController.searchMedia.bind(mediaController));

// Library collections management
router.post('/collections/build', mediaController.buildCollection.bind(mediaController));
router.get('/collections', mediaController.getCollections.bind(mediaController));
router.get('/collections/:collectionId', mediaController.getCollectionDetails.bind(mediaController));
router.put('/collections/:collectionId', mediaController.updateCollection.bind(mediaController));
router.delete('/collections/:collectionId', mediaController.deleteCollection.bind(mediaController));

// Personalized recommendations
router.post('/recommendations', mediaController.getRecommendations.bind(mediaController));

// Content management
router.post('/save', mediaController.saveToLibrary.bind(mediaController));

// External API synchronization
router.post('/sync', mediaController.syncWithExternalAPIs.bind(mediaController));

// Media sources information
router.get('/sources', mediaController.getMediaSources.bind(mediaController));

// Statistics and analytics
router.get('/statistics', mediaController.getStatistics.bind(mediaController));

export default router;
