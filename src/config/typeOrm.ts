import { DataSource, DataSourceOptions } from "typeorm";
import {config as dotevn} from "dotenv";
import {registerAs} from '@nestjs/config';

dotevn({path:'.env'});

console.log("dropSchema: ", process.env.DROPSCHEMA)

const typeOrmConfig={
    type:'postgres',
    host: process.env.DB_HOST,
    port:  process.env.DB_PORT as unknown as number,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    autoloadEntities:true,
    logging:['error'],
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations:['dist/migrations/*{.ts,.js}'],
    synchronize:true,
    dropSchema: true, // Convert string to boolean
    // dropSchema: process.env.DROPSCHEMA === 'true', // Convert string to boolean
}

export default registerAs('typeorm',()=>typeOrmConfig)
export const conectionSource = new DataSource(typeOrmConfig as DataSourceOptions);