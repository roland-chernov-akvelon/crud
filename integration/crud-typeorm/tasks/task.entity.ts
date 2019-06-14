import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '../base-entity';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  status: string;

  @Column({ nullable: false })
  companyId: number;

  @Column({ nullable: false })
  projectId: number;

  @Column({ nullable: false })
  userId: number;

  /**
   * Relations
   */

  @ManyToOne(() => Project, o => o.tasks)
  project: Project;

  @ManyToOne(() => User, o => o.tasks)
  user: User;
}
