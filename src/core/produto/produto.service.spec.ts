import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { Produto } from './entities/produto.entity';
import { ProdutoService } from './produto.service';
import { ExportPdfService } from '../../shared/services/export-pdf.service';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let repository: Repository<Produto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoService,
        {
          provide: getRepositoryToken(Produto),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn()
          },
        },
        {
          provide: 'GRPC_USUARIO',
          useValue: {
            getService: jest.fn(),
            FindOne: jest.fn()
          },
        },
        {
          provide: 'MAIL_SERVICE',
          useValue: {
            emit: jest.fn(),
            get: jest.fn()
          }
        },
        {
          provide: ExportPdfService,
          useValue: {
            export: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<ProdutoService>(ProdutoService);

    repository = module.get<Repository<Produto>>(getRepositoryToken(Produto));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockProduto));

      const response = await service.create(createProdutoDto);

      expect(response).toEqual(mockProduto);
      expect(spyRepositorySave).toHaveBeenCalled();
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

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaProduto, 1]));

      const response = await service.findAll(0, 10, mockOrderFilter, null);

      expect(response.data).toEqual(mockListaProduto);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('obter uma listagem de produtos por descrição', async () => {

      const mockFilter = { column: 'descricao', value: 'Leite' }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaProduto, 1]));

      const response = await service.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaProduto);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('obter uma listagem de produtos ativos', async () => {

      const mockFilter = { column: 'ativo', value: true }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaProduto, 1]));

      const response = await service.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaProduto);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
    
    it('obter uma listagem de produtos por ids', async () => {

      const mockFilter = { column: 'id', value: 1 }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaProduto, 1]));

      const response = await service.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaProduto);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

  });

  describe('findOne', () => {
    it('obter um usuário', async () => {
      const mockProduto = {
        id: 1,
        descricao: 'Leite Integral',
        precoCusto: 10.00,
        precoVenda: 12.00,
        imagem: undefined,
        ativo: true,
        codigoBarras: ['7891000100103']
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockProduto));

      const response = await service.findOne(1);

      expect(response).toEqual(mockProduto);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um produto', async () => {
      const updateProdutoDto = {
        id: 1,
        descricao: 'Leite Integral',
        precoCusto: 10.00,
        precoVenda: 12.00,
        imagem: undefined,
        ativo: true,
        codigoBarras: ['7891000100103']
      };

      const mockProduto = Object.assign(updateProdutoDto, {});

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockProduto));

      const response = await service.update(1, updateProdutoDto);

      expect(response).toEqual(updateProdutoDto);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao enviar ids diferentes quando alterar um produto', async () => {
      const updateProdutoDto = {
        id: 1,
        descricao: 'Leite Integral',
        precoCusto: 10.00,
        precoVenda: 12.00,
        imagem: undefined,
        ativo: true,
        codigoBarras: ['7891000100103']
      };

      try {
        await service.update(2, updateProdutoDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.IDsDiferentes);
      }
    });

  });

  describe('unactivate', () => {
    it('desativar um produto', async () => {
      const mockProdutoFindOne = {
        id: 1,
        descricao: 'Leite Integral',
        precoCusto: 10.00,
        precoVenda: 12.00,
        imagem: undefined,
        ativo: true,
        codigoBarras: ['7891000100103']
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockProdutoFindOne));

      const mockProdutoSave = Object.assign(mockProdutoFindOne, {
        ativo: false,
      });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockProdutoSave));

      const response = await service.unactivate(1);

      expect(response).toEqual(false);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao não encontrar o produto usando o id quando alterar um produto', async () => {
      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(null));

      try {
        await service.unactivate(1);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.ImpossivelAlterar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });
});
