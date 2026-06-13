import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(name: string, email: string, passwordString: string): Promise<{
        user: {
            koperasi: {
                id: string;
                name: string;
                address: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            koperasiId: string | null;
        };
        access_token: string;
    }>;
    login(email: string, passwordString: string): Promise<{
        user: {
            koperasi: {
                id: string;
                name: string;
                address: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            koperasiId: string | null;
        };
        access_token: string;
    }>;
    validateUserById(id: string): Promise<{
        koperasi: {
            id: string;
            name: string;
            address: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        koperasiId: string | null;
    } | null>;
}
