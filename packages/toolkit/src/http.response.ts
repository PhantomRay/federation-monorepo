import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';

export enum Ack {
  success = 'success',
  error = 'error',
  warning = 'warning'
}

export class HttpError400 extends BadRequestException {
  constructor(message: any = 'Bad request') {
    super({
      ack: Ack.error,
      message
    });
  }
}

export class HttpError401 extends UnauthorizedException {
  constructor(message: any = 'Unauthorized') {
    super({
      ack: Ack.error,
      message
    });
  }
}

export class HttpError403 extends ForbiddenException {
  constructor(message: any = 'Forbidden') {
    super({
      ack: Ack.error,
      message
    });
  }
}

export class HttpError404 extends NotFoundException {
  constructor(message: any = 'Not found') {
    super({
      ack: Ack.error,
      message
    });
  }
}

export class HttpError307 extends HttpException {
  constructor(message: any = 'Temporary Redirect') {
    super(
      {
        ack: Ack.error,
        message
      },
      HttpStatus.TEMPORARY_REDIRECT
    );
  }
}

export class HttpError429 extends HttpException {
  constructor(message: any = 'Too many requests') {
    super(
      {
        ack: Ack.error,
        message
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}

export class HttpError500 extends InternalServerErrorException {
  constructor(message: any = 'Internal server error') {
    super({
      ack: Ack.error,
      message
    });
  }
}
