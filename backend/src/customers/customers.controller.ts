import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @UseGuards(SessionAuthGuard)
  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    const customer = await this.customersService.createCustomer(dto);

    return {
      message: 'Customer created successfully',
      customer,
    };
  }

  @UseGuards(SessionAuthGuard)
  @Get()
  async findAll(@Query('search') search?: string) {
    const customers = await this.customersService.findAllCustomers(search);

    return {
      total: customers.length,
      customers,
    };
  }

  @UseGuards(SessionAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customersService.findCustomerById(id);
  }

  @UseGuards(SessionAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const customer = await this.customersService.updateCustomer(id, dto);

    return {
      message: 'Customer updated successfully',
      customer,
    };
  }

  @UseGuards(SessionAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.customersService.deleteCustomer(id);

    return {
      message: 'Customer deleted successfully',
    };
  }
}
