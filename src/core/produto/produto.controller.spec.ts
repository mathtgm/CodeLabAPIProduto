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

      const spyServiceFindAll = jest
        .spyOn(service, 'findAll')
        .mockReturnValue(Promise.resolve(mockListaProduto) as any);

      const response = await controller.findAll(1, 10);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockListaProduto);
      expect(spyServiceFindAll).toHaveBeenCalled();
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
      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockProduto) as any);

      const response = await controller.findOne(1);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockProduto);
      expect(spyServiceFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um usuário', async () => {
      const mockProduto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockReturnValue(Promise.resolve(mockProduto) as any);

      const response = await controller.update(1, mockProduto);

      expect(response.message).toEqual(EMensagem.AtualizadoSucesso);
      expect(response.data).toEqual(mockProduto);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });

  describe('unactivate', () => {
    it('desativar um usuário', async () => {
      const spyServiceUpdate = jest
        .spyOn(service, 'unactivate')
        .mockReturnValue(Promise.resolve(false) as any);

      const response = await controller.unactivate(1);

      expect(response.message).toEqual(EMensagem.DesativadoSucesso);
      expect(response.data).toEqual(false);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });
});
