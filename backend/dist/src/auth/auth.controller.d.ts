import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<{
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
