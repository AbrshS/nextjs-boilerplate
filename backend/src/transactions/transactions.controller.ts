import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@ApiTags('Transactions & Dashboard')
@ApiBearerAuth()
@Controller({
  path: 'transactions',
  version: '1',
})
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a new financial transaction' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transaction recorded' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated transactions with status filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Paginated transactions list' })
  findAll(@Query() query: QueryTransactionDto) {
    return this.transactionsService.findManyWithPagination(query);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get financial KPI summary metrics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'KPI cards data (Gross Revenue, Margins, Churn, Active)' })
  getMetrics() {
    return this.transactionsService.getFinancialKPIs();
  }

  @Get('cashflow')
  @ApiOperation({ summary: 'Get 12-month aggregated cashflow time-series' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cashflow points for Recharts' })
  getCashflow() {
    return this.transactionsService.getCashflowSeries();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Transaction details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findById(id);
  }
}
