import { Request, Response } from 'express';
import { prisma } from '@/index';
import { AuditService, AuditAction, AuditResource } from '@/services/auditService';
import { cacheService } from '@/services/cacheService';

export class LibraryController {
  // Get all books
  static async getBooks(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        author,
        available,
        sortBy = 'title',
        sortOrder = 'asc'
      } = req.query;

      const cacheKey = `library:books:${JSON.stringify(req.query)}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { isbn: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (category) where.category = category;
      if (author) where.author = { contains: author, mode: 'insensitive' };
      if (available !== undefined) {
        where.available = available === 'true';
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [books, total] = await Promise.all([
        prisma.libraryBook.findMany({
          where,
          include: {
            _count: {
              select: {
                borrowRecords: {
                  where: {
                    returnedAt: null
                  }
                }
              }
            }
          },
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.libraryBook.count({ where })
      ]);

      const result = {
        data: books.map(book => ({
          ...book,
          currentBorrows: book._count.borrowRecords,
          availableCopies: book.totalCopies - book._count.borrowRecords
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      };

      await cacheService.set(cacheKey, result, { ttl: 300 });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting books:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve books'
      });
    }
  }

  // Get book by ID
  static async getBookById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const cacheKey = `library:book:${id}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const book = await prisma.libraryBook.findUnique({
        where: { id: parseInt(id) },
        include: {
          borrowRecords: {
            where: {
              returnedAt: null
            },
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                      email: true
                    }
                  }
                }
              }
            },
            orderBy: { borrowedAt: 'desc' }
          },
          _count: {
            select: {
              borrowRecords: true
            }
          }
        }
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          error: 'Book not found'
        });
      }

      const bookWithStats = {
        ...book,
        totalBorrows: book._count.borrowRecords,
        currentBorrows: book.borrowRecords.length,
        availableCopies: book.totalCopies - book.borrowRecords.length
      };

      await cacheService.set(cacheKey, bookWithStats, { ttl: 600 });

      res.json({
        success: true,
        data: bookWithStats
      });
    } catch (error) {
      console.error('Error getting book by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve book'
      });
    }
  }

  // Create new book
  static async createBook(req: Request, res: Response) {
    try {
      const {
        title,
        author,
        isbn,
        category,
        description,
        totalCopies,
        publisher,
        publishedYear,
        location
      } = req.body;

      // Check if ISBN already exists
      if (isbn) {
        const existingBook = await prisma.libraryBook.findUnique({
          where: { isbn }
        });

        if (existingBook) {
          return res.status(400).json({
            success: false,
            error: 'Book with this ISBN already exists'
          });
        }
      }

      const book = await prisma.libraryBook.create({
        data: {
          title,
          author,
          isbn,
          category,
          description,
          totalCopies: parseInt(totalCopies),
          availableCopies: parseInt(totalCopies),
          publisher,
          publishedYear: publishedYear ? parseInt(publishedYear) : null,
          location
        }
      });

      await cacheService.invalidateLibraryCache();

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.CREATE,
        AuditResource.LIBRARY_BOOK,
        book.id,
        { title, author, isbn }
      );

      res.status(201).json({
        success: true,
        data: book
      });
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create book'
      });
    }
  }

  // Update book
  static async updateBook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        author,
        category,
        description,
        totalCopies,
        publisher,
        publishedYear,
        location,
        available
      } = req.body;

      const existingBook = await prisma.libraryBook.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingBook) {
        return res.status(404).json({
          success: false,
          error: 'Book not found'
        });
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (author) updateData.author = author;
      if (category) updateData.category = category;
      if (description) updateData.description = description;
      if (totalCopies) updateData.totalCopies = parseInt(totalCopies);
      if (publisher) updateData.publisher = publisher;
      if (publishedYear) updateData.publishedYear = parseInt(publishedYear);
      if (location) updateData.location = location;
      if (available !== undefined) updateData.available = available;

      const book = await prisma.libraryBook.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      await cacheService.invalidateLibraryCache();
      await cacheService.del(`library:book:${id}`);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.LIBRARY_BOOK,
        parseInt(id),
        updateData
      );

      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update book'
      });
    }
  }

  // Delete book
  static async deleteBook(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingBook = await prisma.libraryBook.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: {
              borrowRecords: {
                where: {
                  returnedAt: null
                }
              }
            }
          }
        }
      });

      if (!existingBook) {
        return res.status(404).json({
          success: false,
          error: 'Book not found'
        });
      }

      // Check if book has active borrows
      if (existingBook._count.borrowRecords > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete book with active borrow records'
        });
      }

      await prisma.libraryBook.delete({
        where: { id: parseInt(id) }
      });

      await cacheService.invalidateLibraryCache();
      await cacheService.del(`library:book:${id}`);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.DELETE,
        AuditResource.LIBRARY_BOOK,
        parseInt(id)
      );

      res.json({
        success: true,
        message: 'Book deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete book'
      });
    }
  }

  // Borrow book
  static async borrowBook(req: Request, res: Response) {
    try {
      const { bookId, studentId, dueDate } = req.body;

      // Check if book exists and is available
      const book = await prisma.libraryBook.findUnique({
        where: { id: parseInt(bookId) },
        include: {
          _count: {
            select: {
              borrowRecords: {
                where: {
                  returnedAt: null
                }
              }
            }
          }
        }
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          error: 'Book not found'
        });
      }

      if (!book.available) {
        return res.status(400).json({
          success: false,
          error: 'Book is not available for borrowing'
        });
      }

      if (book._count.borrowRecords >= book.totalCopies) {
        return res.status(400).json({
          success: false,
          error: 'No copies available for borrowing'
        });
      }

      // Check if student exists
      const student = await prisma.student.findUnique({
        where: { id: parseInt(studentId) }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }

      // Check if student has overdue books
      const overdueBooks = await prisma.borrowRecord.count({
        where: {
          studentId: parseInt(studentId),
          returnedAt: null,
          dueDate: {
            lt: new Date()
          }
        }
      });

      if (overdueBooks > 0) {
        return res.status(400).json({
          success: false,
          error: 'Student has overdue books. Please return them first.'
        });
      }

      // Create borrow record
      const borrowRecord = await prisma.borrowRecord.create({
        data: {
          bookId: parseInt(bookId),
          studentId: parseInt(studentId),
          borrowedAt: new Date(),
          dueDate: new Date(dueDate)
        },
        include: {
          book: {
            select: {
              title: true,
              author: true
            }
          },
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      await cacheService.invalidateLibraryCache();
      await cacheService.invalidateStudentCache(parseInt(studentId));

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.CREATE,
        AuditResource.BORROW_RECORD,
        borrowRecord.id,
        { bookId, studentId, dueDate }
      );

      res.status(201).json({
        success: true,
        data: borrowRecord
      });
    } catch (error) {
      console.error('Error borrowing book:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to borrow book'
      });
    }
  }

  // Return book
  static async returnBook(req: Request, res: Response) {
    try {
      const { borrowId } = req.params;

      const borrowRecord = await prisma.borrowRecord.findUnique({
        where: { id: parseInt(borrowId) },
        include: {
          book: {
            select: {
              title: true,
              author: true
            }
          },
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!borrowRecord) {
        return res.status(404).json({
          success: false,
          error: 'Borrow record not found'
        });
      }

      if (borrowRecord.returnedAt) {
        return res.status(400).json({
          success: false,
          error: 'Book has already been returned'
        });
      }

      // Update borrow record
      const updatedRecord = await prisma.borrowRecord.update({
        where: { id: parseInt(borrowId) },
        data: {
          returnedAt: new Date()
        }
      });

      await cacheService.invalidateLibraryCache();
      await cacheService.invalidateStudentCache(borrowRecord.studentId);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.BORROW_RECORD,
        parseInt(borrowId),
        { returnedAt: new Date() }
      );

      res.json({
        success: true,
        data: {
          ...updatedRecord,
          book: borrowRecord.book,
          student: borrowRecord.student
        }
      });
    } catch (error) {
      console.error('Error returning book:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to return book'
      });
    }
  }

  // Get student's borrow records
  static async getStudentBorrowRecords(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const {
        page = 1,
        limit = 20,
        status, // 'active', 'returned', 'overdue'
        sortBy = 'borrowedAt',
        sortOrder = 'desc'
      } = req.query;

      const where: any = { studentId: parseInt(studentId) };

      if (status === 'active') {
        where.returnedAt = null;
      } else if (status === 'returned') {
        where.returnedAt = { not: null };
      } else if (status === 'overdue') {
        where.returnedAt = null;
        where.dueDate = { lt: new Date() };
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [records, total] = await Promise.all([
        prisma.borrowRecord.findMany({
          where,
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                isbn: true
              }
            }
          },
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.borrowRecord.count({ where })
      ]);

      const result = {
        data: records,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      };

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting student borrow records:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve borrow records'
      });
    }
  }

  // Get library statistics
  static async getLibraryStatistics(req: Request, res: Response) {
    try {
      const [
        totalBooks,
        availableBooks,
        borrowedBooks,
        overdueBooks,
        popularBooks,
        categoryStats
      ] = await Promise.all([
        prisma.libraryBook.count(),
        prisma.libraryBook.count({ where: { available: true } }),
        prisma.borrowRecord.count({ where: { returnedAt: null } }),
        prisma.borrowRecord.count({
          where: {
            returnedAt: null,
            dueDate: { lt: new Date() }
          }
        }),
        prisma.borrowRecord.groupBy({
          by: ['bookId'],
          where: {
            borrowedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          _count: true,
          orderBy: {
            _count: {
              bookId: 'desc'
            }
          },
          take: 10
        }),
        prisma.libraryBook.groupBy({
          by: ['category'],
          _count: true
        })
      ]);

      // Get book details for popular books
      const popularBookDetails = await prisma.libraryBook.findMany({
        where: {
          id: {
            in: popularBooks.map(pb => pb.bookId)
          }
        },
        select: {
          id: true,
          title: true,
          author: true,
          coverImage: true
        }
      });

      const statistics = {
        overview: {
          totalBooks,
          availableBooks,
          borrowedBooks,
          overdueBooks
        },
        popularBooks: popularBooks.map((pb, index) => ({
          ...popularBookDetails.find(book => book.id === pb.bookId),
          borrowCount: pb._count
        })),
        categoryDistribution: categoryStats.map(cs => ({
          category: cs.category,
          count: cs._count
        }))
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting library statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve library statistics'
      });
    }
  }
}

export { LibraryController };
