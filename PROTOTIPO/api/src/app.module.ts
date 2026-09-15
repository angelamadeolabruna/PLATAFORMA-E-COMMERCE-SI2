import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller.js';
import { SeguridadModule } from './modulos/seguridad/seguridad.module.js';
import { ClientesModule } from './modulos/clientes/clientes.module.js';
import { CatalogoModule } from './modulos/catalogo/catalogo.module.js';
import { ProveedoresModule } from './modulos/proveedores/proveedores.module.js';
import { ComprasModule } from './modulos/compras/compras.module.js';
import { InventarioModule } from './modulos/inventario/inventario.module.js';
import { RespaldosModule } from './modulos/respaldos/RespaldosModule.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: { rejectUnauthorized: false },
      }),
    }),
    SeguridadModule,
    ClientesModule,
    CatalogoModule,
    ProveedoresModule,
    ComprasModule,
    InventarioModule,
    RespaldosModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}