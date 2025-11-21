import { createDish } from '@/controllers/dish.controller'
import { DishStatus } from '@/constants/type'
import prisma from '@/database'

async function main() {
    console.log('--- Testing Add Dish Logic ---')

    const testDish = {
        name: 'Test Dish ' + Date.now(),
        price: 50000,
        description: 'Test description',
        image: 'http://via.placeholder.com/150',
        status: DishStatus.Available
    }

    try {
        const result = await createDish(testDish)
        console.log('[SUCCESS] Created dish:', result)

        // Clean up
        await prisma.dish.delete({ where: { id: result.id } })
        console.log('[INFO] Cleaned up test dish')
    } catch (error) {
        console.error('[ERROR] Failed to create dish:', error)
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
