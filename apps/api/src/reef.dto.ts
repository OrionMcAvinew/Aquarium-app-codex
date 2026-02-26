import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateTankDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  volumeGallons!: number;

  @ApiProperty({ enum: ['MIXED', 'SPS', 'LPS', 'FOWLR'] })
  @IsEnum(['MIXED', 'SPS', 'LPS', 'FOWLR'])
  tankType!: 'MIXED' | 'SPS' | 'LPS' | 'FOWLR';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  equipmentList?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  saltType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  targetParams?: Record<string, number>;
}

export class CreateLivestockDto {
  @ApiProperty()
  @IsString()
  speciesName!: string;

  @ApiProperty({ enum: ['FISH', 'CORAL', 'INVERT'] })
  @IsEnum(['FISH', 'CORAL', 'INVERT'])
  kind!: 'FISH' | 'CORAL' | 'INVERT';

  @ApiProperty()
  @IsDateString()
  acquiredAt!: string;

  @ApiProperty()
  @IsNumber()
  quarantineDays!: number;
}

export class CreateWaterTestDto {
  @IsNumber() no3!: number;
  @IsNumber() po4!: number;
  @IsNumber() alk!: number;
  @IsNumber() @IsOptional() ca?: number;
  @IsNumber() @IsOptional() mg?: number;
  @IsNumber() @IsOptional() ph?: number;
  @IsNumber() @IsOptional() salinity?: number;
  @IsNumber() @IsOptional() temperature?: number;
  @IsNumber() @IsOptional() ammonia?: number;
  @IsNumber() @IsOptional() nitrite?: number;
  @IsOptional() @IsString() note?: string;
}

export class CreateTaskTemplateDto {
  @IsString() name!: string;
  @IsString() cronRule!: string;
  @IsString() tankId!: string;
}

export class CompleteTaskDto {
  @IsString() taskName!: string;
  @IsString() tankId!: string;
}

export class CreateDosingPlanDto {
  @IsString() additiveName!: string;
  @IsNumber() concentration!: number;
  @IsNumber() dailyDoseMl!: number;
  @IsNumber() inventoryMl!: number;
}

export class AlertRuleDto {
  @IsString() parameter!: string;
  @IsNumber() threshold!: number;
  @IsNumber() days!: number;
}

export class SuggestionInputDto {
  @IsBoolean() nitrateTrendUp!: boolean;
  @IsBoolean() maintenanceMissed!: boolean;
  @IsNumber() po4HighDays!: number;
}

export class CsvImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWaterTestDto)
  rows!: CreateWaterTestDto[];
}


export class SendInviteDto {
  @IsString()
  email!: string;
}

export class AcceptInviteDto {
  @IsString()
  token!: string;

  @IsString()
  userId!: string;
}
