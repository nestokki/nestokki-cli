// import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

// @Entity('user')
export class UserEntity {
  idx!: number;
  required!: string;
  nullable!: string | null;
  updatedAt!: Date;
  createdAt!: Date;
  // @PrimaryGeneratedColumn({
  //   name: 'idx',
  //   type: 'int',
  //   unsigned: true,
  //   comment: 'PK',
  // })
  // idx!: number;

  // @ManyToOne(() => ManyToOneEntity, {
  //   onDelete: 'SET NULL',
  //   onUpdate: 'CASCADE',
  // })
  // @JoinColumn({
  //   name: 'many_to_one_idx',
  //   referencedColumnName: 'idx',
  //   foreignKeyConstraintName: 'FK_IDX_user_many_to_one_idx',
  // })
  // manyToOne!: ManyToOneEntity;

  // @OneToMany(() => OneToManyEntity, (oneToMany) => oneToMany.user)
  // oneToMany!: OneToManyEntity[];

  // @Column('varchar', {
  //   name: 'required',
  //   comment: 'Required Column',
  // })
  // required!: string;

  // @Column('varchar', {
  //   name: 'required',
  //   nullable: true,
  //   comment: 'Nullable Column',
  // })
  // nullable!: string | null;

  // @Column('timestamp', {
  //   name: 'updated_at',
  //   onUpdate: 'CURRENT_TIMESTAMP',
  //   default: () => 'CURRENT_TIMESTAMP',
  //   comment: 'Updated At',
  // })
  // updatedAt!: Date;

  // @Column('timestamp', {
  //   name: 'created_at',
  //   default: () => 'CURRENT_TIMESTAMP',
  //   comment: 'Created At',
  // })
  // createdAt!: Date;
}
