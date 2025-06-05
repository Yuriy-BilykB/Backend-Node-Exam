import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import {TokensService} from "../tokens/tokens.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private tokensService: TokensService
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [
            context.getHandler(),
            context.getClass(),
            ]
        );
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) return false;
        const token = authHeader.split(' ')[1];
        try {
            const user = this.tokensService.verifyAccessToken(token);
            request.user = user;
            return requiredRoles.includes(user.role);
        } catch (err) {
            throw new ForbiddenException('Access denied: insufficient permissions');
        }
    }
}
