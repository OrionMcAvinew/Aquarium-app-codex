import { IsEmail, IsEnum, IsString } from 'class-validator';

export class CreateOrgDto {
  @IsString()
  name!: string;
}

export class AddMemberDto {
  @IsString()
  userId!: string;

  @IsEnum(['OWNER', 'ADMIN', 'MEMBER'])
  role!: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export class InviteMemberDto {
  @IsEmail()
  email!: string;
}
