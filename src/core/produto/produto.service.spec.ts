import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { Produto } from './entities/produto.entity';
import { ProdutoService } from './produto.service';

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
          },
        },
      ],
    }).compile();

    service = module.get<ProdutoService>(ProdutoService);

    repository = module.get<Repository<Produto>>(getRepositoryToken(Produto));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('criar um novo usuário', async () => {
      const createProdutoDto = {
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockProduto = Object.assign(createProdutoDto, { id: 1 });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockProduto) as any);

      const response = await service.create(createProdutoDto);

      expect(response).toEqual(mockProduto);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao repetir um email quando criar um novo produto', async () => {
      const createProdutoDto = {
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockProduto = Object.assign(createProdutoDto, { id: 1 });

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockProduto) as any);

      try {
        await service.create(createProdutoDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.ImpossivelCadastrar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('findAll', () => {
    it('obter uma listagem de usuários', async () => {
      const mockListaProduto = [
        {
          id: 1,
          nome: 'Nome Teste',
          email: 'nome.teste@teste.com',
          senha: '123456',
          ativo: true,
          admin: true,
          permissao: [],
        },
      ];

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'find')
        .mockReturnValue(Promise.resolve(mockListaProduto) as any);

      const response = await service.findAll(1, 10);

      expect(response).toEqual(mockListaProduto);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('obter um usuário', async () => {
      const mockProduto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockProduto) as any);

      const response = await service.findOne(1);

      expect(response).toEqual(mockProduto);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um usuário', async () => {
      const updateProdutoDto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockProduto = Object.assign(updateProdutoDto, {});

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockProduto) as any);

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockProduto) as any);

      const response = await service.update(1, updateProdutoDto);

      expect(response).toEqual(updateProdutoDto);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao enviar ids diferentes quando alterar um produto', async () => {
      const updateProdutoDto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      try {
        await service.update(2, updateProdutoDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.IDsDiferentes);
      }
    });

    it('lançar erro ao repetir um email já utilizado quando alterar um produto', async () => {
      const updateProdutoDto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockProdutoFindOne = {
        id: 2,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: 'abcdef',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockProdutoFindOne) as any);

      try {
        await service.update(1, updateProdutoDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.ImpossivelAlterar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('unactivate', () => {
    it('desativar um usuário', async () => {
      const mockProdutoFindOne = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockProdutoFindOne) as any);

      const mockProdutoSave = Object.assign(mockProdutoFindOne, {
        ativo: false,
      });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockProdutoSave) as any);

      const response = await service.unactivate(1);

      expect(response).toEqual(false);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao não encontrar o produto usando o id quando alterar um produto', async () => {
      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(null) as any);

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
