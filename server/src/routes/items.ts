import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/items - List all items
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    res.status(500).json({ error: 'Failed to fetch items' })
  }
})

// GET /api/items/:id - Get single item
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) },
    })
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }
    res.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    res.status(500).json({ error: 'Failed to fetch item' })
  }
})

// POST /api/items - Create an item
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' })
    }
    const item = await prisma.item.create({
      data: { name },
    })
    res.status(201).json(item)
  } catch (error) {
    console.error('Error creating item:', error)
    res.status(500).json({ error: 'Failed to create item' })
  }
})

// PUT /api/items/:id - Update item
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name } = req.body
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' })
    }
    const item = await prisma.item.update({
      where: { id: parseInt(id) },
      data: { name },
    })
    res.json(item)
  } catch (error) {
    console.error('Error updating item:', error)
    res.status(500).json({ error: 'Failed to update item' })
  }
})

// DELETE /api/items/:id - Delete item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.item.delete({
      where: { id: parseInt(id) },
    })
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting item:', error)
    res.status(500).json({ error: 'Failed to delete item' })
  }
})

export default router
