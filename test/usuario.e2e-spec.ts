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
    let id: number;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const produto = {
      nome: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      senha: faker.internet.password(),
      admin: false,
      ativo: true,
    };

    it('criar um novo usuário', async () => {
      const resp = await request(app.getHttpServer())
        .post('/produto')
        .send(produto);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.SalvoSucesso);
      expect(resp.body.data).toHaveProperty('id');

      id = resp.body.data.id;
    });

    it('criar um novo usuário usando o mesmo email', async () => {
      const resp = await request(app.getHttpServer())
        .post('/produto')
        .send(produto);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.ImpossivelCadastrar);
      expect(resp.body.data).toBe(null);
    });

    it('carrega o produto criado', async () => {
      const resp = await request(app.getHttpServer()).get(`/produto/${id}`);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.nome).toBe(produto.nome);
      expect(resp.body.data.email).toBe(produto.email);
      expect(resp.body.data.ativo).toBe(produto.ativo);
      expect(resp.body.data.admin).toBe(produto.admin);
      expect(resp.body.data).toHaveProperty('permissao');
      expect(resp.body.data.password).toBe(undefined);
    });

    it('altera o produto criado', async () => {
      const produtoAlterado = Object.assign(
        { id: id, ativo: false, admin: false },
        produto,
        {},
      );

      const resp = await request(app.getHttpServer())
        .patch(`/produto/${id}`)
        .send(produtoAlterado);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.AtualizadoSucesso);
      expect(resp.body.data).toHaveProperty('id');
      expect(resp.body.data.nome).toBe(produtoAlterado.nome);
      expect(resp.body.data.email).toBe(produtoAlterado.email);
      expect(resp.body.data.ativo).toBe(produtoAlterado.ativo);
      expect(resp.body.data.admin).toBe(produtoAlterado.admin);
      expect(resp.body.data.password).toBe(undefined);
    });

    it('tenta alterar o produto criado passando um id diferente', async () => {
      const produtoAlterado = Object.assign(produto, {
        id: id,
        ativo: false,
        admin: false,
      });

      const resp = await request(app.getHttpServer())
        .patch(`/produto/999`)
        .send(produtoAlterado);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IDsDiferentes);
      expect(resp.body.data).toBe(null);
    });

    it('tenta alterar o produto criado com um email já utilizado', async () => {
      const firstNameTemp = faker.person.firstName();
      const lastNameTemp = faker.person.lastName();

      const produtoTemp = {
        nome: `${firstNameTemp} ${lastNameTemp}`,
        email: faker.internet
          .email({ firstName: firstNameTemp, lastName: lastNameTemp })
          .toLowerCase(),
        senha: faker.internet.password(),
        admin: false,
        ativo: true,
      };

      await request(app.getHttpServer()).post('/produto').send(produtoTemp);

      const produtoAlterado = Object.assign(produto, {
        id: id,
        email: produtoTemp.email,
      });

      const resp = await request(app.getHttpServer())
        .patch(`/produto/${id}`)
        .send(produtoAlterado);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.ImpossivelAlterar);
      expect(resp.body.data).toBe(null);
    });

    it('tenta desativar um usuário inexistente', async () => {
      const resp = await request(app.getHttpServer()).delete(`/produto/999`);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.data).toBe(null);
    });

    it('desativa o produto criado', async () => {
      const resp = await request(app.getHttpServer()).delete(`/produto/${id}`);

      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.data).toBe(false);
    });
  });

  describe('PAGINAÇÃO (findAll) /', () => {
    it('obtem todos os registros da página 1', async () => {
      for (let i = 0; i < 10; i++) {
        const firstNameTemp = faker.person.firstName();
        const lastNameTemp = faker.person.lastName();

        const produto = {
          nome: `${firstNameTemp} ${lastNameTemp}`,
          email: faker.internet
            .email({ firstName: firstNameTemp, lastName: lastNameTemp })
            .toLowerCase(),
          senha: faker.internet.password(),
          admin: false,
          ativo: true,
        };

        await request(app.getHttpServer()).post('/produto').send(produto);
      }

      const resp = await request(app.getHttpServer()).get('/produto/1/10');

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(10);
    });

    it('obtem todos os registros da página 2', async () => {
      const resp = await request(app.getHttpServer()).get('/produto/2/10');

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(2);
    });
  });
});
