import { Controller, INestApplication, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { ormConfig, Task } from '../../integration/typeorm/e2e';
import { Crud, RestfulOptions } from '../../src';
import { RepositoryService } from '../../src/typeorm';

@Injectable()
export class TasksService extends RepositoryService<Task> {
  protected options: RestfulOptions = {};

  constructor(@InjectRepository(Task) repo) {
    super(repo);
  }
}

@Crud(Task, {
  options: {
    join: {
      user: {},
      'user.company': {},
    },
  },
})
@Controller('tasks')
export class TasksController {
  constructor(public service: TasksService) {}
}

describe('Test to reproduce issue #87', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const fixture = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(ormConfig), TypeOrmModule.forFeature([Task])],
      providers: [TasksService],
      controllers: [TasksController],
    }).compile();

    app = fixture.createNestApplication();

    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    app.close();
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

  describe('GET /tasks?join=user&join=user.company&filter=company.name||eq||Google', () => {
    it('should filter by nested user.company.name', async () => {
      // If
      const companyName = 'Google';

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
