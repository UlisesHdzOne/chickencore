import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuarios de ejemplo
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@chickencore.com' },
    update: {},
    create: {
      email: 'admin@chickencore.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'ChickenCore',
      phoneNumber: '+52 555 123 4567',
      isActive: true,
      emailVerified: true,
    },
  });

  const cashierUser = await prisma.user.upsert({
    where: { email: 'cajero@chickencore.com' },
    update: {},
    create: {
      email: 'cajero@chickencore.com',
      password: hashedPassword,
      role: 'CASHIER',
      firstName: 'Cajero',
      lastName: 'Principal',
      phoneNumber: '+52 555 123 4568',
      isActive: true,
      emailVerified: true,
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'usuario@test.com' },
    update: {},
    create: {
      email: 'usuario@test.com',
      password: hashedPassword,
      role: 'USER',
      firstName: 'Usuario',
      lastName: 'Test',
      phoneNumber: '+52 555 123 4569',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Usuarios creados');

  // Crear categorías
  const categorias = [
    { name: 'Pollos', description: 'Pollos en diferentes presentaciones', sortOrder: 1 },
    { name: 'Acompañamientos', description: 'Salsas, lechugas y otros acompañamientos', sortOrder: 2 },
    { name: 'Bebidas', description: 'Refrescos y bebidas', sortOrder: 3 },
  ];

  const createdCategories = [];
  for (const categoria of categorias) {
    const cat = await prisma.category.upsert({
      where: { name: categoria.name },
      update: {},
      create: categoria,
    });
    createdCategories.push(cat);
  }

  console.log('✅ Categorías creadas');

  // Crear productos base (acompañamientos)
  const lechuga = await prisma.product.upsert({
    where: { name_presentation: { name: 'Lechuga', presentation: 'Bolsa' } },
    update: {},
    create: {
      name: 'Lechuga',
      presentation: 'Bolsa',
      description: 'Lechuga fresca en bolsa',
      price: 1.0,
      hasGifts: false,
      categoryId: createdCategories[1].id,
      stockQuantity: 100,
      minStock: 10,
      imageUrl: 'https://example.com/lechuga.jpg',
    },
  });

  const salsaCruda = await prisma.product.upsert({
    where: { name_presentation: { name: 'Salsa', presentation: 'Cruda' } },
    update: {},
    create: {
      name: 'Salsa',
      presentation: 'Cruda',
      description: 'Salsa cruda picante',
      price: 1.0,
      hasGifts: false,
      categoryId: createdCategories[1].id,
      stockQuantity: 100,
      minStock: 10,
      imageUrl: 'https://example.com/salsa-cruda.jpg',
    },
  });

  const salsaCocida = await prisma.product.upsert({
    where: { name_presentation: { name: 'Salsa', presentation: 'Cocida' } },
    update: {},
    create: {
      name: 'Salsa',
      presentation: 'Cocida',
      description: 'Salsa cocida suave',
      price: 1.0,
      hasGifts: false,
      categoryId: createdCategories[1].id,
      stockQuantity: 100,
      minStock: 10,
      imageUrl: 'https://example.com/salsa-cocida.jpg',
    },
  });

  console.log('✅ Productos base creados');

  // Crear productos de pollo con regalos
  const polloEntero = await prisma.product.upsert({
    where: { name_presentation: { name: 'Pollo', presentation: 'Entero' } },
    update: {},
    create: {
      name: 'Pollo',
      presentation: 'Entero',
      description: 'Pollo entero asado',
      price: 80.0,
      hasGifts: true,
      categoryId: createdCategories[0].id,
      stockQuantity: 50,
      minStock: 5,
      imageUrl: 'https://example.com/pollo-entero.jpg',
      gifts: {
        create: [
          { giftId: salsaCruda.id, quantity: 3 },
          { giftId: salsaCocida.id, quantity: 3 },
          { giftId: lechuga.id, quantity: 3 },
        ],
      },
    },
  });

  const polloMedio = await prisma.product.upsert({
    where: { name_presentation: { name: 'Pollo', presentation: 'Medio' } },
    update: {},
    create: {
      name: 'Pollo',
      presentation: 'Medio',
      description: 'Medio pollo asado',
      price: 45.0,
      hasGifts: true,
      categoryId: createdCategories[0].id,
      stockQuantity: 50,
      minStock: 5,
      imageUrl: 'https://example.com/pollo-medio.jpg',
      gifts: {
        create: [
          { giftId: salsaCruda.id, quantity: 2 },
          { giftId: salsaCocida.id, quantity: 2 },
          { giftId: lechuga.id, quantity: 2 },
        ],
      },
    },
  });

  const polloCuarto = await prisma.product.upsert({
    where: { name_presentation: { name: 'Pollo', presentation: 'Cuarto' } },
    update: {},
    create: {
      name: 'Pollo',
      presentation: 'Cuarto',
      description: 'Cuarto de pollo asado',
      price: 25.0,
      hasGifts: true,
      categoryId: createdCategories[0].id,
      stockQuantity: 50,
      minStock: 5,
      imageUrl: 'https://example.com/pollo-cuarto.jpg',
      gifts: {
        create: [
          { giftId: salsaCruda.id, quantity: 1 },
          { giftId: salsaCocida.id, quantity: 1 },
          { giftId: lechuga.id, quantity: 1 },
        ],
      },
    },
  });

  console.log('✅ Productos de pollo creados');

  // Crear reglas de agendamiento por defecto
  const schedulingRules = [
    {
      dayOfWeek: 1, // Lunes
      isActive: true,
      minAmount: 300,
      minChickenQuantity: 5,
      startTime: '09:00',
      endTime: '18:00',
      description: 'Lunes: Mínimo $300 MXN o 5 pollos',
    },
    {
      dayOfWeek: 2, // Martes
      isActive: true,
      minAmount: 300,
      minChickenQuantity: 5,
      startTime: '09:00',
      endTime: '18:00',
      description: 'Martes: Mínimo $300 MXN o 5 pollos',
    },
    {
      dayOfWeek: 3, // Miércoles
      isActive: true,
      minAmount: 300,
      minChickenQuantity: 5,
      startTime: '09:00',
      endTime: '18:00',
      description: 'Miércoles: Mínimo $300 MXN o 5 pollos',
    },
    {
      dayOfWeek: 4, // Jueves
      isActive: true,
      minAmount: 300,
      minChickenQuantity: 5,
      startTime: '09:00',
      endTime: '18:00',
      description: 'Jueves: Mínimo $300 MXN o 5 pollos',
    },
    {
      dayOfWeek: 5, // Viernes
      isActive: true,
      minAmount: null,
      minChickenQuantity: null,
      startTime: '09:00',
      endTime: '20:00',
      description: 'Viernes: Sin restricciones',
    },
    {
      dayOfWeek: 6, // Sábado
      isActive: true,
      minAmount: null,
      minChickenQuantity: null,
      startTime: '09:00',
      endTime: '20:00',
      description: 'Sábado: Sin restricciones',
    },
    {
      dayOfWeek: 0, // Domingo
      isActive: true,
      minAmount: null,
      minChickenQuantity: null,
      startTime: '10:00',
      endTime: '18:00',
      description: 'Domingo: Sin restricciones',
    },
  ];

  for (const rule of schedulingRules) {
    await prisma.schedulingRule.upsert({
      where: { dayOfWeek: rule.dayOfWeek },
      update: {},
      create: rule,
    });
  }

  console.log('✅ Reglas de agendamiento creadas');

  // Crear carrito de ejemplo para el usuario test
  const cart = await prisma.cart.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      items: {
        create: [
          {
            productId: polloEntero.id,
            quantity: 1,
            selectedGifts: {
              create: [
                { giftId: salsaCruda.id, quantity: 2 },
                { giftId: lechuga.id, quantity: 3 },
              ],
            },
          },
          {
            productId: polloCuarto.id,
            quantity: 2,
            selectedGifts: {
              create: [
                { giftId: salsaCocida.id, quantity: 2 },
                { giftId: lechuga.id, quantity: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Carrito de ejemplo creado');

  console.log('🎉 Seed completado exitosamente!');
  console.log('📧 Usuarios creados:');
  console.log('   - Admin: admin@chickencore.com / password123');
  console.log('   - Cajero: cajero@chickencore.com / password123');
  console.log('   - Usuario: usuario@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });