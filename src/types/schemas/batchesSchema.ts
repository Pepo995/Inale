import * as z from "zod";

const createBatchesSchema = z.object({
  batches: z.array(
    z.object({
      amount: z.number().gte(1),
      dairyRut: z.number().gte(1).lte(999999999999),
    })
  ),
});

export { createBatchesSchema };
