import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from '@user/entities/user.entity';

dotenv.config();

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD + '',
  database: process.env.POSTGRES_DATABASE,
  synchronize: false,
  entities: [UserEntity],
  migrationsTableName: 'migrations',
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
};

export const dataSource = new DataSource(typeormConfig);
