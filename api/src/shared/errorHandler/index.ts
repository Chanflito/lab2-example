import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaClientKnownRequestErrorFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = HttpStatus.BAD_REQUEST;
    const errorMessageLines = exception.message.split('\n');
    const trimmedErrorMessage = [
      errorMessageLines[0],
      errorMessageLines[errorMessageLines.length - 1],
    ].join(' ');

    response.status(status).json({
      statusCode: status,
      message: trimmedErrorMessage,
    });
  }
}
