import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsIn, IsObject, IsOptional } from 'class-validator';

class BaseUpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}

export class UpdateUserDto extends BaseUpdateUserDto {
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @IsOptional()
  @IsIn(['public', 'private'])
  profileVisibility?: 'public' | 'private';

  @IsOptional()
  @IsBoolean()
  allowDataTracking?: boolean;

  @IsOptional()
  @IsObject()
  dataUsagePrefs?: { lowData?: boolean; disableAudio?: boolean; wifiOnly?: boolean };
}
