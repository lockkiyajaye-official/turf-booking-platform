import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, OnboardingStatus } from '../database/entities/user.entity';
import { Turf } from '../database/entities/turf.entity';
import { Booking, BookingStatus } from '../database/entities/booking.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedingService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Turf)
        private turfRepository: Repository<Turf>,
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
    ) { }

    async seed() {
        // Clear existing data (optional - be careful in production)
        await this.bookingRepository.delete({});
        await this.turfRepository.delete({});
        await this.userRepository.delete({});

        // Create Admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = this.userRepository.create({
            email: 'admin@turfbooking.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            phone: '+1234567890',
            role: UserRole.ADMIN,
            emailVerified: true,
            phoneVerified: true,
            onboardingStatus: OnboardingStatus.COMPLETED,
        });
        const savedAdmin = await this.userRepository.save(admin);

        // Create Normal Users
        const users: User[] = [];
        for (let i = 1; i <= 5; i++) {
            const user = this.userRepository.create({
                email: `user${i}@example.com`,
                phone: `+123456789${i}`,
                firstName: `User${i}`,
                lastName: `Last${i}`,
                role: UserRole.USER,
                emailVerified: true,
                phoneVerified: true,
                onboardingStatus: OnboardingStatus.COMPLETED,
                dateOfBirth: new Date(1990 + i, 0, 1),
                address: `${i}00 Main St`,
                city: 'New York',
                state: 'NY',
                zipCode: `1000${i}`,
                country: 'USA',
            });
            users.push(await this.userRepository.save(user));
        }

        // Create Turf Owners (some approved, some pending)
        const turfOwners: User[] = [];
        for (let i = 1; i <= 4; i++) {
            const isApproved = i <= 2; // First 2 are approved
            const owner = this.userRepository.create({
                email: `owner${i}@turf.com`,
                phone: `+198765432${i}`,
                firstName: `Owner${i}`,
                lastName: `Business${i}`,
                role: UserRole.TURF_OWNER,
                emailVerified: true,
                phoneVerified: true,
                onboardingStatus: OnboardingStatus.COMPLETED,
                isApproved: isApproved,
                businessName: `Turf Business ${i}`,
                businessAddress: `${i}00 Sports Ave`,
                businessPhone: `+198765432${i}`,
                businessDescription: `Professional turf management business ${i}`,
                taxId: `TAX${i}${i}${i}${i}${i}${i}`,
                approvalNotes: isApproved ? 'Approved for business operations' : 'Pending admin review',
            });
            turfOwners.push(await this.userRepository.save(owner));
        }

        // Create Turfs (only for approved owners)
        const turfs: Turf[] = [];
        const approvedOwners = turfOwners.filter((o) => o.isApproved === true);

        for (let i = 0; i < approvedOwners.length; i++) {
            const owner = approvedOwners[i];

            // Create 2-3 turfs per owner
            for (let j = 1; j <= 2 + (i % 2); j++) {
                const isPublished = j === 1; // First turf is published, others are drafts
                const turfData: Partial<Turf> = {
                    name: `${owner.businessName} - Turf ${j}`,
                    description: `High-quality football turf with professional maintenance. Perfect for matches and training sessions.`,
                    address: `${owner.businessAddress}, Turf ${j}`,
                    pricePerHour: 50 + (i * 10) + (j * 5),
                    amenities: ['Parking', 'Changing Rooms', 'Water Facility', 'Lighting', 'Seating Area'],
                    images: [`https://example.com/turf${i}${j}-1.jpg`, `https://example.com/turf${i}${j}-2.jpg`],
                    availableSlots: [
                        '06:00-07:00',
                        '07:00-08:00',
                        '08:00-09:00',
                        '09:00-10:00',
                        '10:00-11:00',
                        '11:00-12:00',
                        '12:00-13:00',
                        '13:00-14:00',
                        '14:00-15:00',
                        '15:00-16:00',
                        '16:00-17:00',
                        '17:00-18:00',
                        '18:00-19:00',
                        '19:00-20:00',
                        '20:00-21:00',
                        '21:00-22:00',
                    ],
                    isActive: true,
                    isPublished: isPublished,
                    isDraft: !isPublished,
                    latitude: 40.7128 + (i * 0.01),
                    longitude: -74.0060 + (j * 0.01),
                    contactPhone: owner.businessPhone || undefined,
                    contactEmail: owner.email,
                    rating: 4.0 + (Math.random() * 1.0),
                    totalReviews: Math.floor(Math.random() * 50) + 10,
                    owner: owner,
                    ownerId: owner.id,
                };
                if (isPublished) {
                    turfData.publishedAt = new Date();
                }
                const turf = this.turfRepository.create(turfData);
                turfs.push(await this.turfRepository.save(turf));
            }
        }

        // Create Bookings
        const bookings: Booking[] = [];
        const publishedTurfs = turfs.filter((t) => t.isPublished === true);

        for (let i = 0; i < 10; i++) {
            const user = users[i % users.length];
            const turf = publishedTurfs[i % publishedTurfs.length];
            const bookingDate = new Date();
            bookingDate.setDate(bookingDate.getDate() + (i % 7)); // Bookings for next 7 days

            const slots = turf.availableSlots;
            const slotIndex = i % slots.length;
            const [startTime, endTime] = slots[slotIndex].split('-');

            const statuses = [
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                BookingStatus.CONFIRMED,
                BookingStatus.COMPLETED,
                BookingStatus.CANCELLED,
            ];
            const status = statuses[i % statuses.length];

            const booking = this.bookingRepository.create({
                user: user,
                userId: user.id,
                turf: turf,
                turfId: turf.id,
                bookingDate: bookingDate,
                startTime: startTime,
                endTime: endTime,
                totalPrice: Number(turf.pricePerHour),
                status: status,
                notes: `Booking ${i + 1} for ${turf.name}`,
            });
            bookings.push(await this.bookingRepository.save(booking));
        }

        return {
            message: 'Database seeded successfully',
            stats: {
                admins: 1,
                users: users.length,
                turfOwners: turfOwners.length,
                approvedOwners: approvedOwners.length,
                pendingOwners: turfOwners.length - approvedOwners.length,
                turfs: turfs.length,
                publishedTurfs: publishedTurfs.length,
                draftTurfs: turfs.length - publishedTurfs.length,
                bookings: bookings.length,
            },
        };
    }
}
