import Fastify from "fastify";
import cors from "@fastify/cors";
import items from "data/items.json" with { type: "json" };
import { Item } from "src/types.ts";
import { ItemsGetInQuerySchema, ItemUpdateInSchema } from "src/validation.ts";
import { treeifyError, ZodError } from "zod";
import { doesItemNeedRevision } from "./src/utils.ts";

const ITEMS = items as Item[];

const fastify = Fastify({
  logger: true,
});

// await fastify.register((await import("@fastify/middie")).default);
await fastify.register(cors, {
  origin: true,
  methods: ["GET", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

// // Искуственная задержка ответов, чтобы можно было протестировать состояния загрузки
// fastify.use((_, __, next) =>
//   new Promise((res) => setTimeout(res, 300 + Math.random() * 700)).then(next),
// );

// Настройка CORS
// fastify.use((_, reply, next) => {
//   reply.setHeader("Access-Control-Allow-Origin", "*");
//   next();
// });

interface ItemGetRequest extends Fastify.RequestGenericInterface {
  Params: {
    id: string;
  };
}

fastify.get<ItemGetRequest>("/items/:id", (request, reply) => {
  const itemId = Number(request.params.id);

  if (!Number.isFinite(itemId)) {
    reply
      .status(400)
      .send({ success: false, error: "Item ID path param should be a number" });
    return;
  }

  const item = ITEMS.find((item) => item.id === itemId);

  if (!item) {
    reply
      .status(404)
      .send({ success: false, error: "Item with requested id doesn't exist" });
    return;
  }

  return {
    ...item,
    needsRevision: doesItemNeedRevision(item),
  };
});

interface ItemsGetRequest extends Fastify.RequestGenericInterface {
  Querystring: {
    q?: string;
    limit?: string;
    skip?: string;
    categories?: string;
    needsRevision?: string;
  };
}

fastify.get<ItemsGetRequest>("/items", (request) => {
  const {
    q,
    limit,
    skip,
    needsRevision,
    categories,
    sortColumn,
    sortDirection,
  } = ItemsGetInQuerySchema.parse(request.query);

  const filteredItems = ITEMS.filter((item) => {
    return (
      item.title.toLowerCase().includes(q.toLowerCase()) &&
      (!needsRevision || doesItemNeedRevision(item)) &&
      (!categories?.length ||
        categories.some((category) => item.category === category))
    );
  });

  return {
    items: filteredItems
      .toSorted((item1, item2) => {
        let comparisonValue = 0;

        if (!sortDirection) return comparisonValue;

        if (sortColumn === "title") {
          comparisonValue = item1.title.localeCompare(item2.title);
        } else if (sortColumn === "createdAt") {
          comparisonValue =
            new Date(item1.createdAt).valueOf() -
            new Date(item2.createdAt).valueOf();
        }

        return (sortDirection === "desc" ? -1 : 1) * comparisonValue;
      })
      .slice(skip, skip + limit)
      .map((item) => ({
        id: item.id,
        category: item.category,
        title: item.title,
        price: item.price,
        needsRevision: doesItemNeedRevision(item),
      })),
    total: filteredItems.length,
  };
});

interface ItemUpdateRequest extends Fastify.RequestGenericInterface {
  Params: {
    id: string;
  };
}

fastify.put<ItemUpdateRequest>("/items/:id", (request, reply) => {
  const itemId = Number(request.params.id);

  if (!Number.isFinite(itemId)) {
    reply
      .status(400)
      .send({ success: false, error: "Item ID path param should be a number" });
    return;
  }

  const itemIndex = ITEMS.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    reply
      .status(404)
      .send({ success: false, error: "Item with requested id doesn't exist" });
    return;
  }

  try {
    const parsedData = ItemUpdateInSchema.parse({
      category: ITEMS[itemIndex].category,
      ...(request.body as {}),
    });

    ITEMS[itemIndex] = {
      id: ITEMS[itemIndex].id,
      createdAt: ITEMS[itemIndex].createdAt,
      updatedAt: new Date().toISOString(),
      ...parsedData,
    };

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      reply.status(400).send({ success: false, error: treeifyError(error) });
      return;
    }

    throw error;
  }
});

fastify.post("/ai/generate-description", async (request, reply) => {
  try {
    const { title, category, price, params } = request.body as {
      title: string;
      category: string;
      price: number;
      params: Record<string, unknown>;
    };

    const prompt = `
Сгенерируй короткое, понятное и продающее описание объявления.
Пиши только на русском языке.
Не используй markdown, звёздочки и списки.
Не добавляй выдуманные характеристики.
Не добавляй контакты, доставку, торг, если этого нет во входных данных.

Данные объявления:
Название: ${title}
Категория: ${category}
Цена: ${price}
Характеристики: ${JSON.stringify(params)}

Верни только готовый текст описания.
`;

    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      reply
        .status(500)
        .send({ success: false, error: "Ollama request failed" });
      return;
    }

    const data = (await ollamaResponse.json()) as { response?: string };

    return {
      suggestedDescription: data.response?.trim() ?? "",
    };
  } catch (error) {
    reply
      .status(500)
      .send({ success: false, error: "Failed to generate description" });
  }
});

fastify.post("/ai/suggest-price", async (request, reply) => {
  try {
    const { title, category, price, params } = request.body as {
      title: string;
      category: string;
      price: number;
      params: Record<string, unknown>;
    };

    const prompt = `
Оцени примерную рыночную цену товара.
Пиши только на русском языке.
Верни только одно число без валюты, без пояснений, без текста.

Данные объявления:
Название: ${title}
Категория: ${category}
Текущая цена: ${price}
Характеристики: ${JSON.stringify(params)}
`;

    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      reply
        .status(500)
        .send({ success: false, error: "Ollama request failed" });
      return;
    }

    const data = (await ollamaResponse.json()) as { response?: string };

    const rawText = data.response?.trim() ?? "";
    const parsedNumber = Number(rawText.replace(/[^\d]/g, ""));

    return {
      suggestedPrice: Number.isNaN(parsedNumber) ? price : parsedNumber,
    };
  } catch (error) {
    reply
      .status(500)
      .send({ success: false, error: "Failed to suggest price" });
  }
});

const port = Number(process.env.PORT) || 8080;

fastify.listen({ port }, function (err, _address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  fastify.log.debug(`Server is listening on port ${port}`);
});
