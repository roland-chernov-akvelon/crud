import { Controller, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { TasksService } from '../__fixture__/tasks.service';
import { Task } from '../../../../integration/crud-typeorm/tasks/task.entity';
import { withCache } from '../../../../integration/crud-typeorm/orm.config';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '../../../../integration/shared/https-exception.filter';
import { Entities } from '../__fixture__/constants';

import { Crud } from '../../../crud/src/decorators/crud.decorator';

describe('Test to reproduce issue #87', () => {

  @Crud({
    model: {
      type: Task,
    },
    query: {
      join: {
        'user': {},
        'user.company': {},
      },
    },
  })
  @Controller('tasks')
  class TasksController {
    constructor(public service: TasksService) {
    }
  }

  let app: INestApplication;
  let server: any;
  let service: any;

  beforeAll(async () => {
    const fixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(withCache),
        TypeOrmModule.forFeature(Entities),
      ],
      controllers: [TasksController],
      providers: [
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        TasksService,
      ],
    }).compile();

    app = fixture.createNestApplication();
    service = app.get(TasksService);

    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /tasks', () => {
    it('should return a list of tasks', async () => {
      // When
      const res = await request(server)
        .get('/tasks')
        .expect(200);

      expect(res.body).toEqual(expect.any(Array));
    });
  });

  describe('GET /tasks?join=user&join=user.company', () => {
    it('should return a list of tasks with nested user.company.* entities', async () => {
      // When
      const res = await request(server)
        .get('/tasks?join=user&join=user.company')
        .expect(200);

      // Then
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            user: expect.objectContaining({
              company: expect.objectContaining({
                name: expect.any(String),
              }),
            }),
          }),
        ]),
      );
    });
  });

  describe('GET /tasks?join=user&join=user.company&filter=company.name||eq||Name1', () => {
    it('should filter by nested user.company.name', async () => {
      // If
      const companyName = 'Name1';

      // When
      const res = await request(server)
        .get(`/tasks?join=user&join=user.company&filter=company.name||eq||${companyName}`)
        .expect(200);

      // Then
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            user: expect.objectContaining({
              company: expect.objectContaining({
                name: companyName,
              }),
            }),
          }),
        ]),
      );
    });
  });
});
