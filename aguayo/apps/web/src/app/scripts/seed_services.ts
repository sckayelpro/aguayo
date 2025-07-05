// scripts/seed_services.ts (ejemplo de un script de siembra simple)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = [
    { title: 'Limpieza', description: 'Servicio de limpieza general', price: 25.00, category: 'Hogar' },
    { title: 'Jardinería', description: 'Cuidado y mantenimiento de jardines', price: 40.00, category: 'Exterior' },
    { title: 'Plomería', description: 'Reparación de fugas y desatascos', price: 60.00, category: 'Hogar' },
    // Puedes añadir más
  ];

  for (const serviceData of services) {
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        // providerId y requesterId son opcionales (String?) ahora, no necesitas darlos
      },
    });
    console.log(`Created service: ${service.title} (ID: ${service.id})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });