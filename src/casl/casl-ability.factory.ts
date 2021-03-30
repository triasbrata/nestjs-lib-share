import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { ConflictException, Injectable } from '@nestjs/common';
import { uniq } from 'lodash';
import { User } from '@lib/entities/entities/user.entity';
import { Action } from '../types/action.enum';
import { Subject } from '../types/subject.enum';

export type AppAbility = Ability<[Action, Subject]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subject]>
    >(Ability as AbilityClass<AppAbility>);
    let userCan: string[] = [];
    let userCant: string[] = [];
    if (!user?.role) {
      throw new ConflictException('role user not found');
    }
    for (const role of user.role) {
      for (const roleCanDo of role.can) {
        if (roleCanDo.active) {
          userCan.push(
            `${roleCanDo.permission.action}-${roleCanDo.permission.subject}`,
          );
        } else {
          userCant.push(
            `${roleCanDo.permission.action}-${roleCanDo.permission.subject}`,
          );
        }
      }
    }
    userCan = uniq(userCan);
    userCant = uniq(userCant).filter(it => !userCan.includes(it));
    for (const uCan of userCan) {
      const [action, subject] = uCan.split('-');
      can(action as Action, subject as Subject);
    }
    for (const uCant of userCant) {
      const [action, subject] = uCant.split('-');
      cannot(action as Action, subject as Subject);
    }
    return build();
  }
}
