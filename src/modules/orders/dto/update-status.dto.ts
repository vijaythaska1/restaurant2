import { IsEnum } from 'class-validator';

export class UpdateStatusDto {
  @IsEnum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'], {
    message: 'Status must be one of: pending, confirmed, preparing, ready, completed, cancelled',
  })
  status: string;
}
