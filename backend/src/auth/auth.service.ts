import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, passwordString: string, roleInput?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordString, salt);

    let koperasiId: string | undefined = undefined;
    let supplierId: string | undefined = undefined;
    let finalRole: any = 'ANGGOTA';

    if (roleInput === 'supplier' || roleInput === 'SUPPLIER') {
      // Create a default Supplier record
      const supplier = await this.prisma.supplier.create({
        data: {
          name: `Pemasok ${name}`,
          address: 'Alamat Pemasok Baru',
          phone: '08123456789',
        },
      });
      supplierId = supplier.id;
      finalRole = 'SUPPLIER';
    } else {
      // Create a default Koperasi record
      const koperasi = await this.prisma.koperasi.create({
        data: {
          name: `Koperasi ${name}`,
          address: 'Alamat Koperasi Baru',
        },
      });
      koperasiId = koperasi.id;
      finalRole = 'ADMIN_KOPERASI';
    }

    // Create User
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        koperasiId,
        supplierId,
        role: finalRole,
      },
      include: { koperasi: true, supplier: true },
    });

    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async login(email: string, passwordString: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { koperasi: true, supplier: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau sandi salah');
    }

    const isMatch = await bcrypt.compare(passwordString, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau sandi salah');
    }

    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async validateUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { koperasi: true, supplier: true },
    });
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan. Silakan login kembali.');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
