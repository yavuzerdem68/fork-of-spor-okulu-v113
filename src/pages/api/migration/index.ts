import { NextApiRequest, NextApiResponse } from 'next'
import { DataMigration } from '@/lib/migration'
import { createSuccessResponse, createErrorResponse } from '@/lib/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json(createErrorResponse('Method not allowed'))
  }

  try {
    // This endpoint should be protected - only admins should be able to run migrations
    // Add authentication check here
    
    const { action, backupKey } = req.body

    switch (action) {
      case 'migrate':
        const result = await DataMigration.migrateFromLocalStorage()
        return res.status(200).json(createSuccessResponse(result, 'Migration completed'))
      
      case 'backup':
        // This would need to be handled client-side since we need access to localStorage
        return res.status(400).json(createErrorResponse('Backup must be created client-side'))
      
      case 'clear':
        // This would also need to be handled client-side
        return res.status(400).json(createErrorResponse('Clear must be executed client-side'))
      
      default:
        return res.status(400).json(createErrorResponse('Invalid action'))
    }
  } catch (error) {
    console.error('Migration API error:', error)
    return res.status(500).json(createErrorResponse('Migration failed'))
  }
}