import { Module } from '@nestjs/common';
import { ClientProxy, Closeable } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportPdfService } from '../../shared/services/export-pdf.service';
import { RmqClientService } from '../../shared/services/rmq-client.service';
import { Produto } from './entities/produto.entity';
import { ProdutoController } from './produto.controller';
import { ProdutoService } from './produto.service';

@Module({
  imports: [TypeOrmModule.forFeature([Produto])],
  controllers: [ProdutoController],
  providers: [
    ProdutoService,
    ExportPdfService,
    RmqClientService,
    {
      provide: 'MAIL_SERVICE',
      useFactory: async (
        rmqClientService: RmqClientService,
      ): Promise<ClientProxy & Closeable> => {
        return rmqClientService.createRabbitmqOptions('mail.enviar-email');
      },
      inject: [RmqClientService],
    },
  ],
})
export class ProdutoModule {}
