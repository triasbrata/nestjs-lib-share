import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigEntity } from '@lib/entities/entities/config.entity';
import { ConfigableService } from './configable.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigEntity])],
  providers: [ConfigableService],
  exports: [ConfigableService]
})
export class ConfigableModule {}
