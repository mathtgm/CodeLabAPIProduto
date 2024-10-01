import { Test, TestingModule } from '@nestjs/testing';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { ProdutoController } from './produto.controller';
import { ProdutoService } from './produto.service';

describe('ProdutoController', () => {
  let controller: ProdutoController;
  let service: ProdutoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutoController],
      providers: [
        {
          provide: ProdutoService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            unactivate: jest.fn(),
            exportPdf: jest.fn()
          },
        },
      ],
    }).compile();

    controller = module.get<ProdutoController>(ProdutoController);
    service = module.get<ProdutoService>(ProdutoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('criar um novo produto', async () => {
      const createProdutoDto = {
        descricao: 'Leite Integral',
        precoCusto: 10.00,
        precoVenda: 12.00,
        imagem: undefined,
        ativo: true,
        codigoBarras: ['7891000100103']
      };

      const mockProduto = Object.assign(createProdutoDto, { id: 1 });

      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(mockProduto) as any);

      const response = await controller.create(createProdutoDto);

      expect(response.message).toEqual(EMensagem.SalvoSucesso);
      expect(response.data).toEqual(mockProduto);
      expect(spyServiceCreate).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {

    const mockListaProduto = [
      {
        id: 1,
        descricao: 'Leite Integral',
        precoCusto: 10.00,
        precoVenda: 12.00,
        imagem: undefined,
        ativo: true,
        codigoBarras: ['7891000100103']
      },
    ];

    const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

    it('obter uma listagem de produtos', async () => {

      const mockFilter = { column: '', value: '' }

      const spyServiceFindAll = jest
        .spyOn(service, 'findAll')
        .mockReturnValue(Promise.resolve({ message: undefined, count: 1, data: mockListaProduto }));

      const response = await controller.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockListaProduto);
      expect(spyServiceFindAll).toHaveBeenCalled();
    });

  });

  describe('findOne', () => {
    it('obter um produto', async () => {
      const mockProduto = {
        id: 1,
        descricao: 'Leite Integral',
        precoCusto: 10.00,
        precoVenda: 12.00,
        imagem: undefined,
        ativo: true,
        codigoBarras: ['7891000100103']
      };

      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockProduto));

      const response = await controller.findOne(1);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockProduto);
      expect(spyServiceFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um produto', async () => {
      const mockProduto = {
        id: 1,
        descricao: 'Leite Integral',
        precoCusto: 10.00,
        precoVenda: 12.00,
        imagem: undefined,
        ativo: true,
        codigoBarras: ['7891000100103']
      };

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockReturnValue(Promise.resolve(mockProduto));

      const response = await controller.update(1, mockProduto);

      expect(response.message).toEqual(EMensagem.AtualizadoSucesso);
      expect(response.data).toEqual(mockProduto);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });

  describe('unactivate', () => {
    it('desativar produto', async () => {
      const spyServiceUpdate = jest
        .spyOn(service, 'unactivate')
        .mockReturnValue(Promise.resolve(false) as any);

      const response = await controller.unactivate(1);

      expect(response.message).toEqual(EMensagem.DesativadoSucesso);
      expect(response.data).toEqual(false);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });
  
  describe('exportPdf', () => {
    it('exporta um PDF', async () => {

      const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };
      const mockFilter = { column: '', value: '' }

      const spyServiceExportPdf = jest
        .spyOn(service, 'exportPdf')
        .mockReturnValue(Promise.resolve(true));

      const response = await controller.exportPdf(1, mockOrderFilter, mockFilter);

      expect(response.message).toEqual(EMensagem.IniciadaGeracaoPDF);
      expect(response.data).toEqual(true);
      expect(spyServiceExportPdf).toHaveBeenCalled();
    });
  });
});
