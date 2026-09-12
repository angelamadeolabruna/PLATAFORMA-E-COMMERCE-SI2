import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  enviarBienvenida(email: string, token: string): boolean {
    const baseUrl = this.config.get<string>('EMAIL_BASE_URL', 'https://tiendasmontano.com');
    const url = `${baseUrl}/confirmar-cuenta?token=${token}`;

    const emailEnabled = String(this.config.get<string>('EMAIL_ENABLED', 'false')).toLowerCase() === 'true';

    if (!emailEnabled) {
      this.logger.log(`[EMAIL SIMULADO] Para: ${email}`);
      this.logger.log('[EMAIL SIMULADO] Asunto: Bienvenido a Tiendas Montaño — confirma tu cuenta');
      this.logger.log(`[EMAIL SIMULADO] Enlace: ${url}`);
      return true;
    }

    try {
      this._enviarViaSmtp(email, url);
      return true;
    } catch (error) {
      this.logger.error(`[EMAIL ERROR] No se pudo enviar a ${email}: ${String(error)}`);
      return false;
    }
  }

  enviarPrimeraContrasena(email: string, token: string): boolean {
    const baseUrl = this.config.get<string>('EMAIL_BASE_URL', 'https://tiendasmontano.com');
    const url = `${baseUrl}/establecer-contraseña?token=${token}`;

    const emailEnabled = String(this.config.get<string>('EMAIL_ENABLED', 'false')).toLowerCase() === 'true';

    if (!emailEnabled) {
      this.logger.log(`[EMAIL SIMULADO] Para: ${email}`);
      this.logger.log('[EMAIL SIMULADO] Asunto: Tiendas Montaño — establece tu contraseña');
      this.logger.log(`[EMAIL SIMULADO] Enlace: ${url}`);
      return true;
    }

    try {
      this._enviarViaSmtp(email, url);
      return true;
    } catch (error) {
      this.logger.error(`[EMAIL ERROR] No se pudo enviar a ${email}: ${String(error)}`);
      return false;
    }
  }

  enviarRecuperacionContrasena(email: string, token: string): boolean {
    const baseUrl = this.config.get<string>('EMAIL_BASE_URL', 'https://tiendasmontano.com');
    const url = `${baseUrl}/restablecer-contraseña?token=${token}`;

    const emailEnabled = String(this.config.get<string>('EMAIL_ENABLED', 'false')).toLowerCase() === 'true';

    if (!emailEnabled) {
      this.logger.log(`[EMAIL SIMULADO] Para: ${email}`);
      this.logger.log('[EMAIL SIMULADO] Asunto: Restablece tu contraseña en Tiendas Montaño');
      this.logger.log(`[EMAIL SIMULADO] Enlace: ${url}`);
      return true;
    }

    try {
      this._enviarViaSmtp(email, url);
      return true;
    } catch (error) {
      this.logger.error(`[EMAIL ERROR] No se pudo enviar a ${email}: ${String(error)}`);
      return false;
    }
  }

  private _enviarViaSmtp(_email: string, _url: string): void {
    throw new Error('SMTP aún no configurado en el prototipo.');
  }
}