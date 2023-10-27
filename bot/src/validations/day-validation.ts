import { z } from "zod";

export const daySchema = z.preprocess(Number, z.number());
