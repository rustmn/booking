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
        }
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
        return {
          error: `Field ${item.field} is not valid`
        }
      }
      return {
        completed: true
      };
    }
  }
}