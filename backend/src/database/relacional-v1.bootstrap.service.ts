import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

@Injectable()
export class RelacionalV1BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(RelacionalV1BootstrapService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const scriptPath = join(process.cwd(), 'relacional_v1.sql');

    try {
      const sql = await readFile(scriptPath, 'utf8');
      await this.dataSource.query(sql);
    } catch (error) {
      this.logger.warn(
        `No se pudo ejecutar ${scriptPath}. Continua sin bootstrap SQL.`,
      );
    }
  }
}
