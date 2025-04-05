import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ description: 'Message describing the result of the operation' })
  public message: string;

  @ApiProperty({ description: 'HTTP status code' })
  public statusCode: number;

  @ApiProperty({ description: 'Response data' })
  public data?: T;

  constructor(message: string, code: number, data?: T) {
    this.message = message;
    this.statusCode = code;
    this.data = data;
  }
}