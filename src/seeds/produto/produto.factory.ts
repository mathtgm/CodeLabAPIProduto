import { fakerPT_BR as faker } from '@faker-js/faker';
import { CreateProdutoDto } from 'src/core/produto/dto/create-produto.dto';
import { Produto } from 'src/core/produto/entities/produto.entity';
import { define } from 'typeorm-seeding';

define(Produto, () => {
  const produto = new CreateProdutoDto();

  const precoCusto = faker.commerce.price({ min: 1, max: 99, dec: 2 });
  const precoVenda = (Number(precoCusto) * 1.3).toFixed(2);

  produto.descricao = faker.commerce.productName();
  produto.precoCusto = precoCusto;
  produto.precoVenda = precoVenda;
  produto.ativo = true;
  produto.codigoBarras = [faker.commerce.isbn(13).replace(/-/g, '')];

  return new Produto(produto);
});
