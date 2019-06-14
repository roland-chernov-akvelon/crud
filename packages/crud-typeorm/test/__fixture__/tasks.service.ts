import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmCrudService } from '../../../crud-typeorm/src/typeorm-crud.service';
import { Task } from '../../../../integration/crud-typeorm/tasks/task.entity';

@Injectable()
export class TasksService extends TypeOrmCrudService<Task> {
  constructor(@InjectRepository(Task) repo) {
    super(repo);
  }
}
