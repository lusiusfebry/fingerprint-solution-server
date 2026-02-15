import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@ApiTags('Shifts')
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shift' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all shifts' })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  findAll(@Query('active') active?: string) {
    return this.shiftsService.findAll(active === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shift by ID' })
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shift' })
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.update(id, updateShiftDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or deactivate shift' })
  remove(@Param('id') id: string) {
    return this.shiftsService.remove(id);
  }

  @Get(':id/employees')
  @ApiOperation({ summary: 'Get employees assigned to a shift' })
  getEmployees(@Param('id') id: string) {
    return this.shiftsService.getEmployeesByShift(id);
  }
}
