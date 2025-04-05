import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public hellCheck(): string {
    return 'HellCheck!';
  }
}
