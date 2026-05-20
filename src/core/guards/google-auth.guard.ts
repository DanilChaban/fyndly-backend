import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isLanguageCode } from '@core/helpers/is-language-code';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const lang = request.query.lang;

    return {
      state: isLanguageCode(lang) ? lang : 'en',
    };
  }
}
