import { Controller } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

@Crud(Task, {
  options: {
    join: {
      'user': {},
      'user.company': {},
    },
  },
})
@ApiUseTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(public service: TasksService) {}
}
