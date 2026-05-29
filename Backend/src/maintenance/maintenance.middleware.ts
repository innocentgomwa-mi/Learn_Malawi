import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../system-settings/entities/system-setting.entity';

const ADMIN_ROLES = ['Admin', 'Administrator'];

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly systemSettingsRepository: Repository<SystemSetting>,
  ) {}

  private decodeJwtPayload(token: string) {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;
      const decoded = Buffer.from(payload, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const maintenanceSetting = await this.systemSettingsRepository.findOne({
      where: { key: 'maintenance_mode' },
    });

    if (!maintenanceSetting || maintenanceSetting.value !== 'true') {
      return next();
    }

    const requestPath = (req.originalUrl || req.url || req.path).split('?')[0].replace(/\/+$/, '');
    const allowedPublicPaths = new Set([
      '/system-settings',
      '/auth/login',
      '/auth/refresh',
      '/auth/two-factor/verify',
      '/auth/two-factor/enable/request',
      '/auth/two-factor/enable/confirm',
    ]);

    if (allowedPublicPaths.has(requestPath) || requestPath.startsWith('/auth') || requestPath.startsWith('/system-settings')) {
      return next();
    }

    const authHeader = String(req.headers.authorization || '');
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      const payload = this.decodeJwtPayload(token);
      if (payload && ADMIN_ROLES.includes(payload.role)) {
        return next();
      }
    }

    res.status(503).json({
      message: 'The site is currently under maintenance. Please try again later.',
    });
  }
}
