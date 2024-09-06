import { DataSource, DataSourceOptions } from "typeorm";
import {config as dotevn} from "dotenv";
import {registerAs} from '@nestjs/config';
import { logging } from "googleapis/build/src/apis/logging";

dotevn({path:'.env'});

console.info("dropSchema: ", process.env.DROPSCHEMA)
console.info("DB_TYPE: ", process.env.DB_TYPE)

const typeOrmConfig={
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port:  process.env.DB_PORT as unknown as number,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    autoloadEntities:true,
    //logging: true,
    logging:['error'],
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations:['dist/migrations/*{.ts,.js}'],
    synchronize:true,
    dropSchema: process.env.DROPSCHEMA === 'true', // Convert string to boolean
}

export default registerAs('typeorm',()=>typeOrmConfig)
export const conectionSource = new DataSource(typeOrmConfig as DataSourceOptions);
