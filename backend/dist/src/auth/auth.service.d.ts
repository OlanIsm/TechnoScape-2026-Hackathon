import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(name: string, email: string, passwordString: string): Promise<{
        user: {
            koperasi: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                address: string;
            } | null;
            name: string;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            koperasiId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        access_token: string;
    }>;
    login(email: string, passwordString: string): Promise<{
        user: {
            koperasi: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                address: string;
            } | null;
            name: string;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            koperasiId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        access_token: string;
    }>;
    validateUserById(id: string): Promise<{
        koperasi: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
        } | null;
        name: string;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        koperasiId: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
