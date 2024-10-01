import { fakerPT_BR as faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Produto } from '../src/core/produto/entities/produto.entity';
import { EMensagem } from '../src/shared/enums/mensagem.enum';
import { ResponseExceptionsFilter } from '../src/shared/filters/response-exception.filter';
import { ResponseTransformInterceptor } from '../src/shared/interceptors/response-transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Produto>;
  let produtoBanco;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.useGlobalFilters(new ResponseExceptionsFilter());

    await app.startAllMicroservices();
    await app.init();

    repository = app.get<Repository<Produto>>(getRepositoryToken(Produto));
  });

  afterAll(async () => {
    await repository.delete({});
    await app.close();
  });

  describe('CRUD /', () => {
    let idProduto: number;

    const produto = {
      descricao: faker.commerce.product(),
      precoCusto: faker.commerce.price({dec: 3}),
      precoVenda: faker.commerce.price({dec: 3}),
      ativo: faker.datatype.boolean(),
      imagem: faker.image.dataUri({type: 'svg-base64'}).split(',')[1],
      codigoBarras: [faker.number.int({ min: 1111111111111, max: 9999999999999 })]
    };

    it('criar um novo produto', async () => {
      const resp = await request(app.getHttpServer())
        .post('/produto')
        .send(produto);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.SalvoSucesso);
      expect(resp.body.data).toHaveProperty('id');

      idProduto = resp.body.data.id;
      produtoBanco = resp.body.data;
    });

    it('carrega o produto criado', async () => {
      const resp = await request(app.getHttpServer()).get(`/produto/${+idProduto}`);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.descricao).toBe(produto.descricao);
      expect(resp.body.data.precoCusto).toBe(produto.precoCusto);
      expect(resp.body.data.precoVenda).toBe(produto.precoVenda);
      expect(resp.body.data.ativo).toBe(produto.ativo);
      expect(resp.body.data.codigoBarras.sort().toString()).toEqual(produto.codigoBarras.sort().toString());
    });

    it('altera o produto criado', async () => {
      const produtoAlterado = Object.assign(
        { id: +idProduto, ativo: false },
        produto,
        {},
      );

      const resp = await request(app.getHttpServer())
        .patch(`/produto/${+idProduto}`)
        .send(produtoAlterado);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.AtualizadoSucesso);
      expect(resp.body.data).toHaveProperty('id');
      expect(resp.body.data.descricao).toBe(produto.descricao);
      expect(resp.body.data.precoCusto).toBe(produto.precoCusto);
      expect(resp.body.data.precoVenda).toBe(produto.precoVenda);
      expect(resp.body.data.ativo).toBe(produto.ativo);
      expect(resp.body.data.codigoBarras).toEqual(produto.codigoBarras);
    });

    it('tenta alterar o produto criado passando um id diferente', async () => {
      const produtoAlterado = Object.assign(produto, {
        id: +idProduto,
        ativo: false,
      });

      const resp = await request(app.getHttpServer())
        .patch(`/produto/999`)
        .send(produtoAlterado);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IDsDiferentes);
      expect(resp.body.data).toBe(null);
    });

    it('tenta desativar um produto inexistente', async () => {
      const resp = await request(app.getHttpServer()).delete(`/produto/999`);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.data).toBe(null);
    });

    it('desativa o produto criado', async () => {
      const resp = await request(app.getHttpServer()).delete(`/produto/${+idProduto}`);

      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.data).toBe(false);
    });
  });

  describe('PAGINAÇÃO (findAll) /', () => {
    const filter = {column: 'id', sort: 'asc'}

    it('obtem todos os registros da página 1', async () => {
      for (let i = 0; i < 10; i++) {

        const produto = {
          descricao: faker.commerce.product(),
          precoCusto: faker.commerce.price({dec: 3}),
          precoVenda: faker.commerce.price({dec: 3}),
          imagem: faker.image.dataUri({type: 'svg-base64'}).split(',')[1],
          ativo: faker.datatype.boolean(),
          codigoBarras: [faker.number.int({ min: 1111111111111, max: 9999999999999 })]
        };

        await request(app.getHttpServer()).post('/produto').send(produto);
      }

      const resp = await request(app.getHttpServer()).get(`/produto/0/5/${JSON.stringify(filter)}`);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(5);
    });

    it('obtem todos os registros da página 2', async () => {
      const resp = await request(app.getHttpServer()).get(`/produto/1/5/${JSON.stringify(filter)}`);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(5);
    });

    it('obtem todos os produtos pela descricao', async () => {
      const resp = await request(app.getHttpServer()).get(`/produto/0/5/${JSON.stringify(filter)}`).query({filter: JSON.stringify({column: 'descricao', value: produtoBanco.descricao})});

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });
    
    it('obtem todos os produtos pelo id', async () => {
      const resp = await request(app.getHttpServer()).get(`/produto/0/5/${JSON.stringify(filter)}`).query({filter: JSON.stringify({column: 'id', value: produtoBanco.id})});

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });
    
    it('obtem todos os produtos ativos', async () => {
      const resp = await request(app.getHttpServer()).get(`/produto/0/5/${JSON.stringify(filter)}`).query({filter: JSON.stringify({column: 'ativo', value: true})});;

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });

  });
});
