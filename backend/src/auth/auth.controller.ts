import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthRefreshDto } from './dto/auth-refresh.dto';
import { Auth2FaVerifyDto } from './dto/auth-2fa.dto';
import {
  PasskeyRegisterOptionsDto,
  PasskeyRegisterVerifyDto,
  PasskeyAuthOptionsDto,
  PasskeyAuthVerifyDto,
} from './dto/auth-passkey.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication & IAM')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email & password (Argon2id + transparent bcrypt upgrade)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'JWT tokens or 2FA challenge response' })
  login(@Body() loginDto: AuthEmailLoginDto) {
    return this.authService.validateLogin(loginDto);
  }

  @Post('email/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register account (HIBP k-anonymity breach check + Argon2id)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User account registered' })
  register(@Body() registerDto: AuthRegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT access token using single-flight deduplicated refresh token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rotated token pair' })
  refresh(@Body() refreshDto: AuthRefreshDto) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify TOTP 2FA authenticator challenge' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Authenticated tokens' })
  verifyTwoFactor(@Body() verifyDto: Auth2FaVerifyDto) {
    return this.authService.verifyTwoFactor(verifyDto);
  }

  @Post('passkeys/register-options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate WebAuthn passkey registration options' })
  getPasskeyRegisterOptions(@Body() dto: PasskeyRegisterOptionsDto) {
    return this.authService.generatePasskeyRegistrationOptions(dto.email);
  }

  @Post('passkeys/register-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify WebAuthn passkey registration credential' })
  verifyPasskeyRegistration(@Body() dto: PasskeyRegisterVerifyDto) {
    return this.authService.verifyPasskeyRegistration(dto.email, dto.response);
  }

  @Post('passkeys/auth-options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate WebAuthn passkey authentication options' })
  getPasskeyAuthOptions(@Body() dto: PasskeyAuthOptionsDto) {
    return this.authService.generatePasskeyAuthOptions(dto.email);
  }

  @Post('passkeys/auth-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify WebAuthn passkey assertion and issue JWT session' })
  verifyPasskeyAuth(@Body() dto: PasskeyAuthVerifyDto) {
    return this.authService.verifyPasskeyAuth(dto.email, dto.response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile of current authenticated user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Current user profile' })
  getProfile(@Request() req: any) {
    return req.user;
  }
}
