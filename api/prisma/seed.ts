import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 Creating users...');

  const user1 = await prisma.user.create({
    data: {
      email: 'juan.perez@example.com',
      name: 'Juan Pérez',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'maria.garcia@example.com',
      name: 'María García',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'carlos.lopez@example.com',
      name: 'Carlos López',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'ana.martin@example.com',
      name: 'Ana Martín',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      email: 'luis.gonzalez@example.com',
      name: 'Luis González',
    },
  });

  console.log(`✅ Created ${5} users`);

  // Create posts
  console.log('📝 Creating posts...');

  const posts = await prisma.post.createMany({
    data: [
      {
        title: 'Mi primer post',
        content: 'Este es el contenido de mi primer post en la plataforma.',
        published: true,
        authorId: user1.id,
      },
      {
        title: 'Introducción a TypeScript',
        content: 'TypeScript es un superset de JavaScript que añade tipado estático...',
        published: true,
        authorId: user2.id,
      },
      {
        title: 'Borrador: Ideas para el blog',
        content: 'Aquí tengo algunas ideas que quiero desarrollar más adelante.',
        published: false,
        authorId: user2.id,
      },
      {
        title: 'Trabajando con NestJS',
        content: 'NestJS es un framework de Node.js que utiliza TypeScript por defecto.',
        published: true,
        authorId: user3.id,
      },
      {
        title: 'Azure Blob Storage Guide',
        content: 'Una guía completa sobre cómo usar Azure Blob Storage para almacenar archivos.',
        published: true,
        authorId: user4.id,
      },
      {
        title: 'Prisma y PostgreSQL',
        content: 'Cómo configurar Prisma con PostgreSQL para tu próximo proyecto.',
        published: false,
        authorId: user5.id,
      },
      {
        title: 'Subida de imágenes en aplicaciones web',
        content: 'Mejores prácticas para implementar subida de imágenes segura.',
        published: true,
        authorId: user4.id,
      },
    ],
  });

  console.log(`✅ Created ${posts.count} posts`);


  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });