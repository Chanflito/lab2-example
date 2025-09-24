import { UseGuards } from '@nestjs/common';
import { UserExistsGuard } from '../guards/user-exists.guard';

export const ValidateUserExists = () => UseGuards(UserExistsGuard);