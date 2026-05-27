import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const { school, level, ...safeDto } = createUserDto as any;
    const user = this.usersRepository.create({ ...safeDto, password: hashedPassword });

    return await this.usersRepository.save(user) as unknown as User;
  }

  async createWithHashedPassword(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user) as unknown as User;
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'school', 'level', 'profileImageUrl', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'school', 'level', 'profileImageUrl', 'createdAt', 'updatedAt'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  // Fix: Change return type to Promise<User | null>
  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }


async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // UpdateUserDto doesn't include password, so we can't check it here
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user) as unknown as User;
  }

  async resetPassword(id: string, newPassword: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    return await this.usersRepository.save(user) as unknown as User;
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.remove(user);
  }

  async findTeachers(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.TEACHER },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'profileImageUrl', 'createdAt', 'updatedAt'],
    });
  }
}
