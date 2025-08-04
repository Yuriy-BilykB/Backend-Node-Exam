import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import {TokensService} from "../tokens/tokens.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly tokensServices: TokensService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Unauthorized');
        }

        const token = authHeader.split(' ')[1];
        try {
            const payload = this.tokensServices.verifyAccessToken(token);
            request.user = payload;
            return true;
        }catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}