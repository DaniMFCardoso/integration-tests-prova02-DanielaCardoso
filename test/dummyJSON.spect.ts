import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { StatusCodes } from 'http-status-codes';

describe('DummyJSON API', () => {
  let token = '';
  let idProduto = '';
  let idProduto2 = '';

  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://dummyjson.com';

  p.request.setDefaultTimeout(90000);

  beforeAll(() => {
    p.reporter.add(rep);
  });

  beforeEach(async () => {
    token = await p
      .spec()
      .post(`${baseUrl}/auth/login`)
      .withJson({
        username: 'emilys',
        password: 'emilyspass',
        expiresInMins: 30
      })
      .expectStatus(StatusCodes.OK)
      .expectJsonSchema({
        type: 'object',
        properties: {
          accessToken: {
            type: 'string'
          },
          refreshToken: {
            type: 'string'
          },
          username: {
            type: 'string'
          }
        },
        required: [
          'accessToken',
          'refreshToken',
          'username'
        ]
      })
      .returns('accessToken');
  });

  describe('Validações login', () => {
    it('login inválido', async () => {
      await p
        .spec()
        .post(`${baseUrl}/auth/login`)
        .withJson({
          username: 'usuario_invalido',
          password: 'senha_invalida'
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('login válido', async () => {
      await p
        .spec()
        .get(`${baseUrl}/auth/me`)
        .withHeaders('Authorization', `Bearer ${token}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: {
              type: 'number'
            },
            username: {
              type: 'string'
            },
            email: {
              type: 'string'
            }
          },
          required: [
            'id',
            'username',
            'email'
          ]
        });
    });
  });

  describe('Produtos', () => {
    it('Lista produtos', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            products: {
              type: 'array'
            },
            total: {
              type: 'number'
            },
            skip: {
              type: 'number'
            },
            limit: {
              type: 'number'
            }
          },
          required: [
            'products',
            'total',
            'skip',
            'limit'
          ]
        });
    });

    it('Busca um produto específico', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products/1`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: {
              type: 'number'
            },
            title: {
              type: 'string'
            },
            price: {
              type: 'number'
            },
            description: {
              type: 'string'
            }
          },
          required: [
            'id',
            'title',
            'price',
            'description'
          ]
        });
    });

    it('Cadastro de novo produto', async () => {
      idProduto = await p
        .spec()
        .post(`${baseUrl}/products/add`)
        .withJson({
          title: 'Produto de teste',
          price: 500,
          description: 'Produto criado durante teste automatizado',
          stock: 10
        })
        .expectStatus(StatusCodes.CREATED)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: {
              type: 'number'
            },
            title: {
              type: 'string'
            },
            price: {
              type: 'number'
            }
          },
          required: [
            'id',
            'title',
            'price'
          ]
        })
        .returns('id');

      console.log('Produto criado:', idProduto);
    });

    it('Cadastro de segundo produto', async () => {
      idProduto2 = await p
        .spec()
        .post(`${baseUrl}/products/add`)
        .withJson({
          title: 'Segundo produto de teste',
          price: 1600,
          description: 'Segundo produto criado durante teste',
          stock: 30
        })
        .expectStatus(StatusCodes.CREATED)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: {
              type: 'number'
            },
            title: {
              type: 'string'
            },
            price: {
              type: 'number'
            }
          },
          required: [
            'id',
            'title',
            'price'
          ]
        })
        .returns('id');

      console.log('Segundo produto:', idProduto2);
    });

    it('Atualiza produto', async () => {
      await p
        .spec()
        .put(`${baseUrl}/products/1`)
        .withJson({
          title: 'Produto atualizado'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: {
              type: 'number'
            },
            title: {
              type: 'string'
            }
          },
          required: [
            'id',
            'title'
          ]
        });
    });

    it('Produto inexistente', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products/99999`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });

  describe('Carrinhos', () => {
    it('Lista carrinhos', async () => {
      await p
        .spec()
        .get(`${baseUrl}/carts`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            carts: {
              type: 'array'
            },
            total: {
              type: 'number'
            }
          },
          required: [
            'carts',
            'total'
          ]
        });
    });

    it('Busca carrinho de um usuário', async () => {
      await p
        .spec()
        .get(`${baseUrl}/carts/user/5`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            carts: {
              type: 'array'
            }
          },
          required: [
            'carts'
          ]
        });
    });

    it('Adiciona novo carrinho', async () => {
      await p
        .spec()
        .post(`${baseUrl}/carts/add`)
        .withJson({
          userId: 1,
          products: [
            {
              id: 1,
              quantity: 2
            },
            {
              id: 2,
              quantity: 3
            }
          ]
        })
        .expectStatus(StatusCodes.CREATED)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: {
              type: 'number'
            },
            userId: {
              type: 'number'
            },
            products: {
              type: 'array'
            }
          },
          required: [
            'id',
            'userId',
            'products'
          ]
        });
    });

    it('Atualiza carrinho', async () => {
      await p
        .spec()
        .put(`${baseUrl}/carts/1`)
        .withJson({
          merge: true,
          products: [
            {
              id: 1,
              quantity: 5
            }
          ]
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: {
              type: 'number'
            },
            products: {
              type: 'array'
            }
          },
          required: [
            'id',
            'products'
          ]
        });
    });

    it('Carrinho inexistente', async () => {
      await p
        .spec()
        .get(`${baseUrl}/carts/99999`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });

  afterAll(() => {
    p.reporter.end();
  });
});
