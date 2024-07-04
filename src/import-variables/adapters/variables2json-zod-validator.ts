import { z } from 'zod';

const jsonSchema = z.object({
  version: z.string(),
  collections: z.array(
    z.object({
      name: z.string(),
      modes: z.array(
        z.object({
          name: z.string(),
          variables: z.array(
            z.union([
              z.object({
                name: z.string(),
                type: z.literal('color'),
                isAlias: z.literal(false),
                value: z.object({
                  r: z.number().nonnegative().max(255),
                  g: z.number().nonnegative().max(255),
                  b: z.number().nonnegative().max(255),
                  a: z.number().nonnegative().max(1),
                }),
              }),
              z.object({
                name: z.string(),
                type: z.literal('color'),
                isAlias: z.literal(true),
                value: z.object({
                  collection: z.string(),
                  name: z.string(),
                }),
              }),
              z.object({
                name: z.string(),
                type: z.literal('number'),
                isAlias: z.literal(false),
                value: z.number(),
              }),
              z.object({
                name: z.string(),
                type: z.literal('number'),
                isAlias: z.literal(true),
                value: z.object({
                  collection: z.string(),
                  name: z.string(),
                }),
              }),
            ]),
          ),
        }),
      ),
    }),
  ),
});

export const variables2JsonZodValidator = (data: unknown) => {
  return jsonSchema.parse(data);
};
