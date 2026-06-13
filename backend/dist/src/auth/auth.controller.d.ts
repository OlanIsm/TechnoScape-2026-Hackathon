import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(name: string, email: string, passwordString: string, role?: string): Promise<{
        user: {
            koperasi: {
                id: string;
                name: string;
                address: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            supplier: never;
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
            supplier: never;
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
    getProfile(req: any): Promise<{
        koperasi: {
            id: string;
            name: string;
            address: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        supplier: never;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        koperasiId: string | null;
    }>;
}
