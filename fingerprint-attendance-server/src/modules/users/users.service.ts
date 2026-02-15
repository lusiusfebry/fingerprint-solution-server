import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CryptoUtil } from '../../common/utils/crypto.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const role = await this.roleRepository.findOneBy({
      id: createUserDto.role_id,
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });
    if (existingUser) {
      throw new BadRequestException('Username or Email already exists');
    }

    const hashedPassword = await CryptoUtil.hashPassword(
      createUserDto.password,
    );

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role,
    });

    const savedUser = await this.userRepository.save(newUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      relations: ['role'],
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        is_active: true,
        last_login: true,
        created_at: true,
        updated_at: true,
        role: {
          id: true,
          name: true,
          description: true,
        },
      },
    });
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result as User;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['role'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.role_id) {
      const role = await this.roleRepository.findOneBy({
        id: updateUserDto.role_id,
      });
      if (!role) throw new NotFoundException('Role not found');
      user.role = role;
      delete updateUserDto.role_id;
    }

    if (updateUserDto.username || updateUserDto.email) {
      const existing = await this.userRepository.findOne({
        where: [
          { username: updateUserDto.username, id: Not(id) },
          { email: updateUserDto.email, id: Not(id) },
        ],
      });
      if (existing) {
        throw new BadRequestException('Username or Email already in use');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser;
    return result as User;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await CryptoUtil.comparePassword(
      changePasswordDto.old_password,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Invalid old password');
    }

    user.password = await CryptoUtil.hashPassword(
      changePasswordDto.new_password,
    );
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    if (user.id === currentUser.id) {
      throw new BadRequestException('Cannot delete yourself');
    }

    user.is_active = false;
    await this.userRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { last_login: new Date() });
  }
}
