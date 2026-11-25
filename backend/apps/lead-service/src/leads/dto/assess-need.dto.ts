import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class AssessNeedDto {
  @ApiProperty({ description: 'Answer to "Do they have a need?"' })
  @IsBoolean()
  hasNeed: boolean;

  @ApiPropertyOptional({
    description: 'When hasNeed is false, plan reconnection in 3 or 6 months (Nurturing)',
    enum: [3, 6],
  })
  @IsOptional()
  @IsIn([3, 6])
  reconnectInMonths?: 3 | 6;
}