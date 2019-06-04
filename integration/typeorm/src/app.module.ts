import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { withCache } from './orm.config';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [TypeOrmModule.forRoot(withCache), CompaniesModule, UsersModule, TasksModule],
})
export class AppModule {}
