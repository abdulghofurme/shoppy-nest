import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [PrismaModule, ProductsModule],
  exports: [UsersService]
})
export class UsersModule {}
