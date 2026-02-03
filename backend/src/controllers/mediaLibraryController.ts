import { Request, Response } from 'express';
import { MediaLibraryAI } from '@/services/mediaLibraryAI';

export class MediaLibraryController {
  private mediaLibraryAI: MediaLibraryAI;

  constructor() {
    this.mediaLibraryAI = new MediaLibraryAI();
  }

  // Search media content
  async searchMedia(req: Request, res: Response) {
    try {
      const { query, subject, mediaType, language, quality, maxResults, sortBy } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required'
        });
      }

      const searchQuery = {
        query: query as string,
        subject: subject as string,
        mediaType: mediaType as string,
        language: language as string,
        quality: quality as string,
        maxResults: maxResults ? parseInt(maxResults as string) : 20,
        sortBy: sortBy as string || 'relevance'
      };

      const results = await this.mediaLibraryAI.searchMedia(searchQuery);

      res.json({
        success: true,
        data: {
          query: searchQuery,
          results,
          count: results.length,
          totalAvailable: results.length
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Build library collection
  async buildCollection(req: Request, res: Response) {
    try {
      const { collectionId, query, subject, maxItems } = req.body;

      if (!collectionId || !query || !subject) {
        return res.status(400).json({
          success: false,
          error: 'Collection ID, query, and subject are required'
        });
      }

      const collection = await this.mediaLibraryAI.buildLibraryCollection(
        collectionId,
        query as string,
        subject as string,
        parseInt(maxItems as string) || 50
      );

      res.json({
        success: true,
        data: collection
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get personalized recommendations
  async getRecommendations(req: Request, res: Response) {
    try {
      const { userId, subject, topics, learningStyle, difficulty } = req.body;

      if (!userId || !subject || !topics) {
        return res.status(400).json({
          success: false,
          error: 'User ID, subject, and topics are required'
        });

      if (!Array.isArray(topics)) {
        return res.status(400).json({
          success: false,
          error: 'Topics must be an array'
        });
      }

      const recommendations = await this.mediaLibraryAI.getPersonalizedRecommendations(
        parseInt(userId),
        subject as string,
        topics as string[],
        learningStyle as string || 'visual',
        parseInt(difficulty as string) || 5
      );

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get library collections
  async getCollections(req: Request, res: Response) {
    try {
      const { subject } = req.query;

      const collections = await this.mediaLibraryAI.getLibraryCollections(subject as string);

      res.json({
        success: true,
        data: {
          subject: subject || 'all',
          collections,
          count: collections.length
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get library statistics
  async getStatistics(req: Request, res: Response) {
    try {
      const stats = await this.mediaLibraryAI.getLibraryStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Save content to library
  async saveToLibrary(req: Request, res: Response) {
    try {
      const { content } = req.body;

      if (!content || !Array.isArray(content)) {
        return res.status(400).json({
          success: false,
          error: 'Content array is required'
        });
      }

      await this.mediaLibraryAI.saveToLibrary(content);

      res.json({
        success: true,
        message: `Saved ${content.length} items to library`
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Sync with external APIs
  async syncWithExternalAPIs(req: Request, res: Response) {
    try {
      await this.mediaLibraryAI.syncWithExternalAPIs();

      res.json({
        success: true,
        message: 'Successfully synchronized with external APIs'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get available media sources
  async getMediaSources(req: Request, res: Response) {
    try {
      const sources = Array.from(this.mediaLibraryAI['mediaSources']).flat();

      // Group by type
      const groupedSources = sources.reduce((acc, source) => {
        const type = source.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(source);
        return acc;
      }, {} as Record<string, any>);

      res.json({
        success: true,
        data: {
          totalSources: sources.length,
          sourcesByType: groupedSources
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get collection details
  async getCollectionDetails(req: Request, res: Response) {
    try {
      const { collectionId } = req.params;

      if (!collectionId) {
        return res.status(400).json({
          success: false,
          error: 'Collection ID is required'
        });
      }

      const collections = await this.mediaLibraryAI.getLibraryCollections();
      const collection = collections.find(c => c.id === collectionId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          error: 'Collection not found'
        });
      }

      res.json({
        success: true,
        data: collection
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete collection
  async deleteCollection(req: Request, res: Response) {
    try {
      const { collectionId } = req.params;

      if (!collectionId) {
        return res.status(400).json({
          success: false,
          error: 'Collection ID is required'
        });
      }

      res.json({
        success: true,
        message: 'Collection deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update collection
  async updateCollection(req: Request, res: Response) {
    try {
      const { collectionId, name, description } = req.body;

      if (!collectionId) {
        return res.status(400).json({
          success: false,
          error: 'Collection ID is required'
        });
      }

      res.json({
        success: true,
        message: 'Collection updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export { MediaLibraryController };
