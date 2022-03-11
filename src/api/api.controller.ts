import { Get, Post, Controller, Param, Body, Res, HttpCode } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { OrdersService } from '../orders/orders.service';
import {
  OrderDto,
  CalcPriceDto
} from './data.dto';
import { Response } from 'express';

@Controller('api')
export class API {
  constructor(
    private readonly db: DbService,
    private readonly orders: OrdersService
  ) {}
  
  @HttpCode(200)
  @Get('cars/:id')
  async checkAvaialability(@Param('id') id: string) {
    return {
      completed: true,
      data: {
        is_avaialble: this.db.checkAvailability(parseInt(id))
      }
    };
  }

  @HttpCode(200)
  @Post('price')
  async calcPrice(@Body() calcPriceDto: CalcPriceDto, @Res() response: Response) {
    const price = await this.orders.calcPrice(calcPriceDto.id, calcPriceDto.period);
    return response.send({
      completed: true,
      data: {
        price
      }
    })
  }

  @HttpCode(201)
  @Post('order')
  async orderProduct(@Body() orderProductDto: OrderDto, @Res() response: Response) {
    const check = this.validateOptions('product_order', orderProductDto);
    if (check.error) {
      return response.send({
        ...check
      })
    }
    const pre_conditions = [
      {
        label: 'is_availabe',
        check: async ({ id }: { id: number; }) => {
          const in_use = await this.db.checkAvailability(id);
          return !in_use;
        },
        error_message: 'Product is not available now'
      },
      {
        label: 'can_be_ordered',
        check: async ({ id }: { id: number; }) => {
          const last_order_date = await this.db.getLastOrderDate(id);
          const now = new Date();
          if (!last_order_date) {
            return true;
          }
          //@ts-ignore
          if (now - last_order_date < (86400 * 1000) * 3) {
            return false;
          }
          return true;
        },
        error_message: 'Selected product can\'t be ordered right now'
      }
    ];

    for (const condition of pre_conditions) {
      const _check = await condition.check(orderProductDto);
      if (!_check) {
        return response.send({
          completed: false,
          error: condition.error_message
        })
      }
    }
    
    const options = Object.assign({}, orderProductDto);
    if (!options.hasOwnProperty('user_id')) {
      options.user_id = 5;
    }
    //@ts-ignore
    const order = await this.orders.orderProduct(options);
    return response.send({
      completed: true,
      data: {
        order
      }
    })
  }

  @HttpCode(201)
  @Get('report')
  async createReport(@Res() response: Response) {
    const report = await this.orders.report();
    return response.send({
      completed: true,
      data: {
        report
      }
    })
  }

  validateOptions(method: string, body: any) {
    const common_required_fileds = [
      {
        field: 'id',
        type: 'number'
      },
      {
        field: 'period',
        type: 'number',
        check: (value: number): boolean => {
          if (value <= 0 || value > 30) {
            return false;
          }
          return true;
        },
        error_message: 'Period should be in range of 1 and 30'
      }
    ];
    const methods = {
      product_order: {
        required_fileds: [
          ...common_required_fileds,
          {
            field: 'start_date',
            type: 'date',
            check: (value: any): boolean => {
              const dt = new Date(value);
              //@ts-ignore
              if (dt instanceof Date && !isNaN(dt)) {
                return true;
              }
              return false;
            }
          }
        ]
      }
    }
    for (const item of methods[method].required_fileds) {
      if (!body.hasOwnProperty(item.field)) {
        return {
          error: `Field ${item.field} is required`
        }
      }
      const check = item.hasOwnProperty('check') && typeof item.check === 'function' ?
        item.check(body[item.field]) : typeof body[item.field] === item.type;
      if (!check) {
        const response = {
          error: `Field ${item.field} is not valid`
        }
        if (item.hasOwnProperty('error_message')) {
          //@ts-ignore
          response.reason = item.error_message;
        }
        return response;
      }
      return {
        completed: true
      };
    }
  }
}