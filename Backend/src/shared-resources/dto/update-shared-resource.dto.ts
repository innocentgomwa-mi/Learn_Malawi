import { PartialType } from '@nestjs/swagger';
import { CreateSharedResourceDto } from './create-shared-resource.dto';

export class UpdateSharedResourceDto extends PartialType(CreateSharedResourceDto) {}
