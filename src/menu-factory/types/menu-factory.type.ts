import { NavType } from './nav.type';

export interface IMenuFactory {
  factory(): NavType[];
}
