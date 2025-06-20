import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { createSuccessResponse, createErrorResponse, createPaginatedResponse } from '@/lib/api'
import { AthleteFilters, AthleteFormData } from '@/types'
import { UserRole, AthleteStatus } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getAthletes(req, res)
      case 'POST':
        return await createAthlete(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json(createErrorResponse('Method not allowed'))
    }
  } catch (error) {
    console.error('Athletes API error:', error)
    return res.status(500).json(createErrorResponse('Internal server error'))
  }
}

async function getAthletes(req: NextApiRequest, res: NextApiResponse) {
  const {
    search,
    sportsBranch,
    status,
    paymentStatus,
    parentId,
    page = '1',
    limit = '10',
    sortBy = 'firstName',
    sortOrder = 'asc'
  } = req.query as AthleteFilters & { [key: string]: string }

  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const skip = (pageNum - 1) * limitNum

  // Build where clause
  const where: any = {}

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { tcNo: { contains: search } },
      {
        parent: {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      }
    ]
  }

  if (status) {
    where.status = status as AthleteStatus
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus
  }

  if (parentId) {
    where.parentId = parentId
  }

  if (sportsBranch) {
    where.sportsBranches = {
      some: {
        sportsBranch: {
          name: sportsBranch
        }
      }
    }
  }

  // Build orderBy clause
  const orderBy: any = {}
  if (sortBy === 'firstName' || sortBy === 'lastName') {
    orderBy[sortBy] = sortOrder
  } else if (sortBy === 'registrationDate') {
    orderBy.registrationDate = sortOrder
  } else if (sortBy === 'birthDate') {
    orderBy.birthDate = sortOrder
  } else {
    orderBy.firstName = 'asc'
  }

  try {
    const [athletes, total] = await Promise.all([
      prisma.athlete.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          parent: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          sportsBranches: {
            include: {
              sportsBranch: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          trainingGroups: {
            include: {
              trainingGroup: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          payments: {
            orderBy: { paymentDate: 'desc' },
            take: 5
          },
          accountEntries: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      }),
      prisma.athlete.count({ where })
    ])

    return res.status(200).json(
      createPaginatedResponse(athletes, pageNum, limitNum, total)
    )
  } catch (error) {
    console.error('Error fetching athletes:', error)
    return res.status(500).json(createErrorResponse('Failed to fetch athletes'))
  }
}

async function createAthlete(req: NextApiRequest, res: NextApiResponse) {
  const data: AthleteFormData = req.body

  if (!data.firstName || !data.lastName || !data.parent) {
    return res.status(400).json(createErrorResponse('Missing required fields'))
  }

  try {
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if parent user exists
      let parentUser = await tx.user.findUnique({
        where: { email: data.parent.email },
        include: { parentProfile: true }
      })

      let parentProfile

      if (parentUser) {
        // Parent user exists, get or create parent profile
        if (parentUser.parentProfile) {
          parentProfile = parentUser.parentProfile
        } else {
          parentProfile = await tx.parentProfile.create({
            data: {
              userId: parentUser.id,
              tcNo: data.parent.tcNo,
              relation: data.parent.relation
            }
          })
        }
      } else {
        // Create new parent user and profile
        parentUser = await tx.user.create({
          data: {
            email: data.parent.email,
            firstName: data.parent.firstName,
            lastName: data.parent.lastName,
            phone: data.parent.phone,
            role: UserRole.PARENT,
            password: 'temp_password', // This should be hashed
            parentProfile: {
              create: {
                tcNo: data.parent.tcNo,
                relation: data.parent.relation
              }
            }
          },
          include: { parentProfile: true }
        })
        parentProfile = parentUser.parentProfile!
      }

      // Create athlete
      const athlete = await tx.athlete.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          tcNo: data.tcNo,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          age: data.age,
          gender: data.gender,
          school: data.school,
          class: data.class,
          photo: data.photo,
          parentId: parentProfile.id,
          status: AthleteStatus.ACTIVE
        },
        include: {
          parent: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          sportsBranches: {
            include: {
              sportsBranch: true
            }
          },
          trainingGroups: {
            include: {
              trainingGroup: true
            }
          },
          payments: true,
          accountEntries: true
        }
      })

      // Add sports branches if provided
      if (data.sportsBranches && data.sportsBranches.length > 0) {
        for (const branchName of data.sportsBranches) {
          // Find or create sports branch
          let sportsBranch = await tx.sportsBranch.findUnique({
            where: { name: branchName }
          })

          if (!sportsBranch) {
            sportsBranch = await tx.sportsBranch.create({
              data: { name: branchName }
            })
          }

          // Link athlete to sports branch
          await tx.athleteSportsBranch.create({
            data: {
              athleteId: athlete.id,
              sportsBranchId: sportsBranch.id
            }
          })
        }
      }

      return athlete
    })

    return res.status(201).json(createSuccessResponse(result, 'Athlete created successfully'))
  } catch (error) {
    console.error('Error creating athlete:', error)
    return res.status(500).json(createErrorResponse('Failed to create athlete'))
  }
}