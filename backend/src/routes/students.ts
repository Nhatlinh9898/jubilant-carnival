import express from 'express';
import { prisma } from '@/index';

const router = express.Router();

// @desc    Get all students
// @route   GET /api/students
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, classId } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (classId) {
      where.classId = parseInt(classId as string);
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.student.count({ where });

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            address: true,
            avatar: true,
          },
        },
        class: true,
        grades: {
          include: {
            subject: true,
          },
        },
        attendance: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create student
// @route   POST /api/students
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const {
      code,
      fullName,
      email,
      password,
      classId,
      dob,
      gender,
      phone,
      address,
    } = req.body;

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        password: password || 'tempPassword123', // Should be hashed
        fullName,
        role: 'STUDENT',
        phone,
        address,
      },
    });

    // Create student
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        code,
        classId: parseInt(classId),
        dob: new Date(dob),
        gender,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            address: true,
          },
        },
        class: true,
      },
    });

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
router.put('/:id', async (req, res, next) => {
  try {
    const { classId, dob, gender, status } = req.body;

    const student = await prisma.student.update({
      where: { id: parseInt(req.params.id) },
      data: {
        classId: classId ? parseInt(classId) : undefined,
        dob: dob ? new Date(dob) : undefined,
        gender,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            address: true,
          },
        },
        class: true,
      },
    });

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    // Delete student and related user
    await prisma.student.delete({
      where: { id: parseInt(req.params.id) },
    });

    await prisma.user.delete({
      where: { id: student.userId },
    });

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
