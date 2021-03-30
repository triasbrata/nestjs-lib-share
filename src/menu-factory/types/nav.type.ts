import { Subject } from '@lib/share/types/subject.enum';

export interface NavType {
  name: string;
  endPoint?: string;
  icon?: string;
  subject: Subject[];
  groupName?: string;
  childs?: NavType[];
}
