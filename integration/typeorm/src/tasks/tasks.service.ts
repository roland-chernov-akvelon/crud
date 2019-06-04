import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestfulOptions } from '@nestjsx/crud';
import { RepositoryService } from '@nestjsx/crud/typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksService extends RepositoryService<Task> {
  protected options: RestfulOptions = {};

  constructor(@InjectRepository(Task) repo) {
    super(repo);
  }
}
