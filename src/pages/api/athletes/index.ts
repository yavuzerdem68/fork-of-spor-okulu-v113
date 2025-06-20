import { NextApiRequest, NextApiResponse } from 'next'
import { createSuccessResponse, createErrorResponse, createPaginatedResponse } from '@/lib/api'
import { AthleteFilters, AthleteFormData, UserRole, AthleteStatus } from '@/types'

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

  try {
    // This would be implemented with actual database queries when prisma is available
    const athletes: any[] = []
    const total = 0

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
    // This would be implemented with actual database operations when prisma is available
    const result = {
      id: 'temp-id',
      ...data,
      status: AthleteStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return res.status(201).json(createSuccessResponse(result, 'Athlete created successfully'))
  } catch (error) {
    console.error('Error creating athlete:', error)
    return res.status(500).json(createErrorResponse('Failed to create athlete'))
  }
}