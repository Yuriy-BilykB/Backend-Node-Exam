import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../interfaces/error-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
    
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        
        let status: number;
        let message: string;
        let error: string;
        
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message = (exceptionResponse as any).message || exception.message;
                error = (exceptionResponse as any).error || exception.name;
            } else {
                message = exception.message;
                error = exception.name;
            }
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'InternalServerError';
            
            this.logger.error('Unhandled exception:', exception);
        }
        
        this.logger.error(
            `HTTP Exception: ${status} - ${error} - ${message}`,
            {
                path: request.url,
                method: request.method,
                timestamp: new Date().toISOString(),
                userAgent: request.get('User-Agent'),
                ip: request.ip,
            }
        );

        const errorResponse: ErrorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message,
            error: error,
        };
        
        response.status(status).json(errorResponse);
    }
} 