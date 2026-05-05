import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';
export type GetProductRecommendationsBodyParam = FromSchema<typeof schemas.GetProductRecommendations.body>;
export type GetProductRecommendationsMetadataParam = FromSchema<typeof schemas.GetProductRecommendations.metadata>;
export type GetProductRecommendationsResponse200 = FromSchema<typeof schemas.GetProductRecommendations.response['200']>;
