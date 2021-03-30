import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmpty } from 'lodash';
import { Repository } from 'typeorm';
import { ConfigEntity } from '@lib/entities/entities/config.entity';

type confTypes = "string" | "number" | "object" | "boolean"| string ;

@Injectable()
export class ConfigableService implements OnModuleInit {
  private readonly config = new Map<string, {type:confTypes, value: string}>()
  constructor(@InjectRepository(ConfigEntity) private readonly confModel: Repository<ConfigEntity>) {
  }
  @Cron(CronExpression.EVERY_HOUR)
  async onModuleInit() {
    const conf = await this.confModel.find();
    conf.forEach(({name,...values}) => {
      if(!this.config.has(name)){
        this.config.set(name, values);
      }
    })
  }

  get<T = any>(name, defVal:T):T{
    if(this.config.has(name)){
      const val = this.config.get(name);
      if(val.type === "string"){
        return val.value as unknown as T;
      }
      if(val.type === "number"){
        return (Number(val.value) as unknown) as T;
      }
      if(val.type === "object" || val.type === "boolean"){
        return (JSON.parse(val.value) as unknown) as T;
      }
    }else{
      return defVal;
    }
  }
  async set(name:string, value:any){
    const type = typeof value;
    let val;
    if(type === "boolean" || type ==="object"){
      val = JSON.stringify(value);
    }
    if(type === "number" || type === "string"){
      val = value;
    }
    if (isEmpty(val)) {
      throw new Error(`Cant save config ${name} with type ${type}`);
    }
    await this.confModel.save({name,val, type});
  }
}
