import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    if (id !== user.id && user.role.name !== 'Super Admin') {
      throw new BadRequestException('You can only change your own password');
    }
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete (soft delete) user' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.usersService.remove(id, user);
  }
}
