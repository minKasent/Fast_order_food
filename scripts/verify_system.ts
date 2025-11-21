import { PrismaClient } from '@prisma/client'
import { Role, TableStatus, DishStatus } from '@/constants/type'

const prisma = new PrismaClient()

async function main() {
    console.log('--- BẮT ĐẦU KIỂM TRA HỆ THỐNG ---')

    // 1. Kiểm tra tài khoản Owner
    const ownerEmail = 'admin@order.com'
    const owner = await prisma.account.findUnique({
        where: { email: ownerEmail }
    })

    if (owner) {
        console.log(`[OK] Tài khoản Owner tồn tại: ${owner.email} (Role: ${owner.role})`)
    } else {
        console.error(`[LỖI] Không tìm thấy tài khoản Owner: ${ownerEmail}`)
    }

    // 2. Kiểm tra Bàn
    const tables = await prisma.table.findMany()
    console.log(`\n[INFO] Tìm thấy ${tables.length} bàn.`)
    if (tables.length === 0) {
        console.warn('[CẢNH BÁO] Không có bàn nào. Chức năng bán hàng sẽ không hoạt động.')
    } else {
        const availableTables = tables.filter(t => t.status === TableStatus.Available)
        console.log(`[INFO] Số bàn khả dụng (Available): ${availableTables.length}`)
        tables.forEach(t => {
            console.log(` - Bàn ${t.number}: ${t.status} (Token: ${t.token})`)
        })
    }

    // 3. Kiểm tra Món ăn
    const dishes = await prisma.dish.findMany()
    console.log(`\n[INFO] Tìm thấy ${dishes.length} món ăn.`)
    if (dishes.length === 0) {
        console.warn('[CẢNH BÁO] Không có món ăn nào.')
    } else {
        const availableDishes = dishes.filter(d => d.status === DishStatus.Available)
        console.log(`[INFO] Số món ăn khả dụng (Available): ${availableDishes.length}`)
    }

    console.log('\n--- HOÀN TẤT KIỂM TRA ---')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
