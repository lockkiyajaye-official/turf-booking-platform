import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedingService } from './seeding.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const seedingService = app.get(SeedingService);
        const result = await seedingService.seed();
        // eslint-disable-next-line no-console
        console.log('Seeding completed:', result);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Seeding failed:', error);
        process.exitCode = 1;
    } finally {
        await app.close();
    }
}

void bootstrap();

