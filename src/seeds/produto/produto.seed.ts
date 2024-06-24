import { Produto } from 'src/core/produto/entities/produto.entity';
import { Factory, Seeder } from 'typeorm-seeding';

export class ProdutoSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(Produto)().createMany(10);
  }
}
