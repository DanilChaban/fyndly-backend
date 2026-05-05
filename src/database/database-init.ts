import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeormConfig: DataSourceOptions = {
    type: 'postgres',
    host: 'localhost',
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD + '',
    database: process.env.POSTGRES_DATABASE,
    synchronize: false,
    entities: [],
};
