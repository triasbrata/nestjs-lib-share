import { SetMetadata } from '@nestjs/common';
import { NavType } from '../menu-factory/types/nav.type';

export const DisableMenu = () => SetMetadata('disableMenu', true);
export const SetMenu = (menus: NavType[]) => SetMetadata('menus', menus);
