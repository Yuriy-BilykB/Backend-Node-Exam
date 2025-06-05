import {UserResponseDto} from "./UserResponseDto";
import {TokensDto} from "../../tokens/dto/TokensDto";
import {ApiProperty} from "@nestjs/swagger";

export class AuthResponseDto {
    @ApiProperty({ type: UserResponseDto, description: 'User information' })
    user: UserResponseDto;

    @ApiProperty({ description: 'JWT tokens' })
    tokens: TokensDto;
}
