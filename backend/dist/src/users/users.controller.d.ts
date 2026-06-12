import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(data: Prisma.UserCreateInput): Promise<{
        name: string;
        id: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        koperasiId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        koperasiId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        koperasiId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
