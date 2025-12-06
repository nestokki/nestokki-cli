import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({
    name: 'idx',
    type: 'int',
    unsigned: true,
    comment: 'PK',
  })
  idx: number;

  @Column('varchar', {
    name: 'required',
    comment: 'Required Column',
  })
  required: string;

  @Column('varchar', {
    name: 'nullable',
    nullable: true,
    comment: 'Nullable Column',
  })
  nullable: string | null;

  @Column('timestamp', {
    name: 'updated_at',
    onUpdate: 'CURRENT_TIMESTAMP',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Updated At',
  })
  updatedAt: Date;

  @Column('timestamp', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Created At',
  })
  createdAt: Date;
}
